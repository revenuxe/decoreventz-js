-- Durable, private email outbox. Database events and queue entries commit together.
CREATE TABLE public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  recipient text, -- NULL means the configured operations inbox.
  reply_to text,
  payload jsonb NOT NULL,
  request jsonb, -- Frozen Resend request: retries must use the identical payload.
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  first_attempt_at timestamptz,
  locked_until timestamptz,
  lock_token uuid,
  resend_id text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX email_outbox_pending ON public.email_outbox (available_at) WHERE status IN ('pending','processing');
CREATE UNIQUE INDEX email_outbox_resend_id ON public.email_outbox (resend_id) WHERE resend_id IS NOT NULL;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_outbox FROM anon, authenticated;
GRANT ALL ON public.email_outbox TO service_role;

CREATE TABLE public.email_delivery_events (
  id text PRIMARY KEY,
  resend_id text NOT NULL,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_delivery_events_resend_id ON public.email_delivery_events (resend_id);
ALTER TABLE public.email_delivery_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_delivery_events FROM anon, authenticated;
GRANT ALL ON public.email_delivery_events TO service_role;

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_submissions_rate ON public.contact_submissions (fingerprint, created_at);
CREATE INDEX contact_submissions_email_rate ON public.contact_submissions (email, created_at);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
GRANT ALL ON public.contact_submissions TO service_role;

CREATE FUNCTION public.queue_email(_key text, _recipient text, _payload jsonb, _reply_to text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  INSERT INTO public.email_outbox(event_key, recipient, payload, reply_to)
  VALUES (_key, _recipient, _payload, _reply_to) ON CONFLICT (event_key) DO NOTHING;
$$;
REVOKE ALL ON FUNCTION public.queue_email(text,text,jsonb,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_email(text,text,jsonb,text) TO service_role;

-- One row per claim with a lease/fencing token; overlapping workers cannot own it.
CREATE FUNCTION public.claim_email()
RETURNS SETOF public.email_outbox LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Resend deduplicates for 24 hours. Never retry an ambiguous send outside that window.
  UPDATE public.email_outbox SET status = 'failed', last_error = 'retry_window_expired: inspect Resend before replay'
  WHERE status IN ('pending','processing') AND first_attempt_at < now() - interval '23 hours'
    AND (locked_until IS NULL OR locked_until < now());
  RETURN QUERY
  UPDATE public.email_outbox e SET status = 'processing', attempts = attempts + 1,
    first_attempt_at = COALESCE(first_attempt_at, now()), locked_until = now() + interval '2 minutes', lock_token = gen_random_uuid()
  WHERE e.id = (
    SELECT q.id FROM public.email_outbox q
    WHERE ((q.status = 'pending' AND q.available_at <= now()) OR (q.status = 'processing' AND q.locked_until < now()))
    ORDER BY q.available_at FOR UPDATE SKIP LOCKED LIMIT 1
  ) RETURNING e.*;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_email() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_email() TO service_role;

CREATE FUNCTION public.submit_contact(_id uuid, _name text, _email text, _phone text, _subject text, _message text, _fingerprint text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE existing public.contact_submissions;
BEGIN
  -- Serialize public submissions for atomic IP/email and global abuse limits.
  PERFORM pg_advisory_xact_lock(78239101);
  SELECT * INTO existing FROM public.contact_submissions WHERE id = _id;
  IF FOUND THEN
    IF existing.email = _email AND existing.name = _name AND existing.phone = _phone AND existing.subject = _subject AND existing.message = _message THEN RETURN 'accepted'; END IF;
    RETURN 'conflict';
  END IF;
  IF (SELECT count(*) FROM public.contact_submissions WHERE fingerprint = _fingerprint AND created_at > now() - interval '1 hour') >= 5
    OR (SELECT count(*) FROM public.contact_submissions WHERE email = _email AND created_at > now() - interval '1 hour') >= 3
    OR (SELECT count(*) FROM public.contact_submissions WHERE created_at > now() - interval '1 day') >= 200 THEN
    RETURN 'rate_limited';
  END IF;
  INSERT INTO public.contact_submissions(id,name,email,phone,subject,message,fingerprint)
  VALUES (_id,_name,_email,_phone,_subject,_message,_fingerprint);
  PERFORM public.queue_email('contact/' || _id || '/admin', NULL,
    jsonb_build_object('title','New contact enquiry','message',_message,'path','/contact','rows',jsonb_build_array(
      jsonb_build_array('Name',_name),jsonb_build_array('Email',_email),jsonb_build_array('Phone',_phone),jsonb_build_array('Subject',_subject))), _email);
  -- Do not echo arbitrary user content to unverified recipients.
  PERFORM public.queue_email('contact/' || _id || '/customer', _email,
    jsonb_build_object('title','We received your message','message','Thank you for contacting Decor Eventz. Our team will get back to you as soon as possible.','path','/contact'));
  RETURN 'accepted';
END;
$$;
REVOKE ALL ON FUNCTION public.submit_contact(uuid,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_contact(uuid,text,text,text,text,text,text) TO service_role;

CREATE FUNCTION public.queue_booking_email(_booking_id uuid, _event text, _key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE b public.bookings; customer_email text; vendor_email text; rows jsonb; payload jsonb;
BEGIN
  SELECT * INTO b FROM public.bookings WHERE id = _booking_id;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT email INTO customer_email FROM auth.users WHERE id = b.user_id;
  SELECT u.email INTO vendor_email FROM public.vendors v JOIN auth.users u ON u.id = v.user_id WHERE v.id = b.assigned_vendor_id;
  rows := jsonb_build_array(jsonb_build_array('Booking',b.order_code), jsonb_build_array('Event date',b.event_date::text),
    jsonb_build_array('Time',b.event_time),jsonb_build_array('Status',b.status::text),
    jsonb_build_array('Venue',concat_ws(', ',b.venue_name,b.venue_line1,b.venue_line2,b.venue_city,b.venue_pincode)),
    jsonb_build_array('Phone',b.venue_phone));
  IF _event IN ('Booking request received','Booking status updated','Booking details updated') THEN
    rows := rows || jsonb_build_array(jsonb_build_array('Booking total','INR ' || b.total::text));
    payload := jsonb_build_object('title',_event || ' - ' || b.order_code,'message',
      CASE WHEN _event = 'Booking request received' THEN 'Your booking request has been received. Our team will contact you to confirm availability and the next steps. This is not a payment receipt.'
      ELSE 'There is an update to your booking. Open your booking for the latest details.' END,
      'rows',rows,'path','/bookings/' || b.id);
    IF customer_email IS NOT NULL THEN PERFORM public.queue_email(_key || '/customer',customer_email,payload); END IF;
  ELSE
    -- Vendor financial information must never appear in a customer email.
    rows := rows || jsonb_build_array(jsonb_build_array('Vendor quote','INR ' || COALESCE(b.vendor_quote_amount::text,'0')),
      jsonb_build_array('Vendor bill','INR ' || COALESCE(b.vendor_bill_amount::text,'0')),
      jsonb_build_array('Vendor payments recorded','INR ' || b.vendor_paid_amount::text));
    payload := jsonb_build_object('title',_event || ' - ' || b.order_code,'message','Please review this booking update in your dashboard.','rows',rows);
  END IF;
  PERFORM public.queue_email(_key || '/admin',NULL,payload || jsonb_build_object('path','/admin/dashboard/bookings'));
  IF vendor_email IS NOT NULL AND _event <> 'Booking request received' THEN
    PERFORM public.queue_email(_key || '/vendor',vendor_email,payload || jsonb_build_object('path','/vendor/dashboard/orders/' || b.id));
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.queue_booking_email(uuid,text,text) FROM PUBLIC, anon, authenticated;

-- Statement trigger: only queue a request after its line items have been saved.
CREATE FUNCTION public.email_booking_items_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE booking_id uuid;
BEGIN
  FOR booking_id IN SELECT DISTINCT n.booking_id FROM new_items n LOOP
    PERFORM public.queue_booking_email(booking_id,'Booking request received','booking/' || booking_id || '/created');
  END LOOP;
  RETURN NULL;
END;
$$;
CREATE TRIGGER email_booking_created AFTER INSERT ON public.booking_items
  REFERENCING NEW TABLE AS new_items FOR EACH STATEMENT EXECUTE FUNCTION public.email_booking_items_inserted();

CREATE FUNCTION public.email_booking_updated()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE event_name text; event_id text := gen_random_uuid()::text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN event_name := 'Booking status updated';
  ELSIF ROW(NEW.event_date,NEW.event_time,NEW.venue_line1,NEW.venue_line2,NEW.venue_city,NEW.venue_pincode,NEW.total) IS DISTINCT FROM ROW(OLD.event_date,OLD.event_time,OLD.venue_line1,OLD.venue_line2,OLD.venue_city,OLD.venue_pincode,OLD.total) THEN event_name := 'Booking details updated';
  END IF;
  IF event_name IS NOT NULL THEN PERFORM public.queue_booking_email(NEW.id,event_name,'booking/' || event_id || '/details'); END IF;
  event_name := NULL;
  IF NEW.assigned_vendor_id IS DISTINCT FROM OLD.assigned_vendor_id THEN event_name := 'Vendor assignment updated';
  ELSIF NEW.vendor_accepted_at IS DISTINCT FROM OLD.vendor_accepted_at THEN event_name := 'Vendor acceptance updated';
  ELSIF ROW(NEW.vendor_quote_amount,NEW.vendor_quote_items) IS DISTINCT FROM ROW(OLD.vendor_quote_amount,OLD.vendor_quote_items) THEN event_name := 'Vendor quote updated';
  ELSIF NEW.vendor_bill_amount IS DISTINCT FROM OLD.vendor_bill_amount THEN event_name := 'Vendor bill updated';
  ELSIF ROW(NEW.vendor_paid_amount,NEW.vendor_payment_status) IS DISTINCT FROM ROW(OLD.vendor_paid_amount,OLD.vendor_payment_status) THEN event_name := 'Vendor payment updated'; END IF;
  IF event_name IS NOT NULL THEN PERFORM public.queue_booking_email(NEW.id,event_name,'booking/' || event_id || '/vendor'); END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER email_booking_changed AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.email_booking_updated();

CREATE FUNCTION public.email_vendor_changed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE recipient text; payload jsonb; event_key text; title text;
BEGIN
  IF TG_OP = 'UPDATE' THEN IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF; END IF;
  SELECT email INTO recipient FROM auth.users WHERE id = NEW.user_id;
  title := CASE WHEN TG_OP = 'INSERT' THEN 'Vendor application received' ELSE 'Vendor application ' || NEW.status::text END;
  event_key := 'vendor/' || NEW.id || '/' || gen_random_uuid();
  payload := jsonb_build_object('title',title,'message','Thank you for partnering with Decor Eventz. Review your application status in your account.',
    'rows',jsonb_build_array(jsonb_build_array('Business',NEW.business_name),jsonb_build_array('Contact',NEW.contact_name),jsonb_build_array('Phone',NEW.phone),jsonb_build_array('Status',NEW.status::text)), 'path','/vendor/status');
  IF recipient IS NOT NULL THEN PERFORM public.queue_email(event_key || '/vendor',recipient,payload); END IF;
  PERFORM public.queue_email(event_key || '/admin',NULL,payload || jsonb_build_object('path','/admin/dashboard/vendors'));
  RETURN NEW;
END;
$$;
CREATE TRIGGER email_vendor_application AFTER INSERT OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.email_vendor_changed();
REVOKE ALL ON FUNCTION public.email_booking_items_inserted() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_booking_updated() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_vendor_changed() FROM PUBLIC, anon, authenticated;
