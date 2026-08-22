-- Vendor accounts: decorators self-apply, admin reviews and approves/rejects.
-- One row per applying user, 1:1 with auth.users (mirrors `profiles`).

CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  status public.vendor_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vendors_status ON public.vendors(status);
GRANT SELECT, INSERT ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors read own row" ON public.vendors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Vendors create own row" ON public.vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all vendors" ON public.vendors FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage vendors" ON public.vendors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Lets a freshly-signed-up user grant themselves the `vendor` role only —
-- deliberately narrower than "any role" so this can never be used to
-- self-grant `admin`. handle_new_user() already gives every new auth.users
-- row a `customer` role; vendor applicants get this on top of that via the
-- vendor sign-up form, not via the trigger.
CREATE POLICY "Users self-apply as vendor" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'vendor');
