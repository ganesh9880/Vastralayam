-- Update or insert profiles for all users
INSERT INTO public.profiles (id, phone_number, full_name, address, approval_status)
VALUES 
  ('8f93a0e6-733c-4284-bcc0-5c049d3ca0c3', '8919601688', 'Ganesh', 'Madhura Nagar, Vijayawada, Vijayawada (Urban), NTR, Andhra Pradesh, 520001, India', 'approved')
ON CONFLICT (id) 
DO UPDATE SET 
  phone_number = EXCLUDED.phone_number,
  full_name = EXCLUDED.full_name,
  address = EXCLUDED.address,
  approval_status = 'approved';

-- Create admin role for user with phone 8919601688
INSERT INTO public.user_roles (user_id, role)
VALUES ('8f93a0e6-733c-4284-bcc0-5c049d3ca0c3', 'admin')
ON CONFLICT DO NOTHING;

-- Also add customer role as default
INSERT INTO public.user_roles (user_id, role)
VALUES ('8f93a0e6-733c-4284-bcc0-5c049d3ca0c3', 'customer')
ON CONFLICT DO NOTHING;