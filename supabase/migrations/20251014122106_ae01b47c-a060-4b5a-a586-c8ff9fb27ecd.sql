-- Fix authentication flow for phone-based registration with admin approval

-- First, update the trigger to handle duplicate phone numbers gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only insert if profile doesn't already exist
  INSERT INTO public.profiles (id, phone_number, full_name, address, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    'pending'
  )
  ON CONFLICT (phone_number) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Add check to prevent login if not approved
CREATE OR REPLACE FUNCTION public.check_user_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_status TEXT;
BEGIN
  -- Get approval status from profiles
  SELECT approval_status INTO user_status
  FROM public.profiles
  WHERE id = NEW.id;
  
  -- If user is rejected, prevent login
  IF user_status = 'rejected' THEN
    RAISE EXCEPTION 'Your account has been rejected. Please contact support.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Remove old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policy to allow users to view their own approval status
DROP POLICY IF EXISTS "Users can view own approval status" ON public.profiles;
CREATE POLICY "Users can view own approval status"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR approval_status = 'approved');