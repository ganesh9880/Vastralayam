-- Approve all pending users
UPDATE public.profiles
SET approval_status = 'approved'
WHERE approval_status = 'pending';

-- Ensure the second user also has admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('23648bb2-1ddb-423a-8366-24131a283a1d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;