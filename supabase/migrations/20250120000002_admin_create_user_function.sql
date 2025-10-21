-- This solves the issue where signUp() automatically logs in the new user

-- Ensure the pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Create a function to create users as admin
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email TEXT,
  user_password TEXT,
  user_phone TEXT,
  user_name TEXT,
  user_address TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id UUID;
  current_admin_id UUID;
BEGIN
  -- Store the current admin's ID to ensure we don't lose context
  current_admin_id := auth.uid();
  
  -- Check if the current user is an admin
  IF NOT public.has_role(current_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Generate new user ID
  new_user_id := gen_random_uuid();

  -- Insert user directly into auth.users table
  -- This bypasses the normal signup flow and doesn't change auth context
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    extensions.crypt(user_password, extensions.gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    json_build_object(
      'phone_number', user_phone,
      'full_name', user_name,
      'address', user_address
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  RETURN new_user_id;
END;
$$;

-- Grant execute permission to authenticated users (will be checked inside function)
GRANT EXECUTE ON FUNCTION public.admin_create_user TO authenticated;
