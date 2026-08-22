-- Safety net: back-fills profiles/user_roles for any auth.users row the
-- handle_new_user() trigger somehow missed (observed once for the initial
-- admin@baraabar.com signup — the trigger is confirmed working via direct
-- testing, but real GoTrue-driven signups don't reliably hit it). Idempotent
-- and safe to run repeatedly.
INSERT INTO public.profiles (id, full_name, phone)
SELECT u.id, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'phone'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'customer'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'customer'
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'admin'
WHERE lower(u.email) = 'admin@baraabar.com' AND ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
