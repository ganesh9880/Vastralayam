-- Auto-approve regular signups, only require admin approval for lease agreements
-- This allows customers to sign up and use the system immediately

-- Update the handle_new_user function to auto-approve regular signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only insert if profile doesn't already exist
  -- Auto-approve regular signups (no lease balance)
  INSERT INTO public.profiles (id, phone_number, full_name, address, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    'approved'  -- Auto-approve regular signups
  )
  ON CONFLICT (phone_number) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Update the check_user_approved function to be more lenient
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
  
  -- Allow pending users to login (they can still browse but lease features will be restricted)
  -- This is more lenient than before
  
  RETURN NEW;
END;
$function$;

-- Add a new function to check if user can access lease features
CREATE OR REPLACE FUNCTION public.can_access_lease_features(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Users can access lease features if:
  -- 1. They are approved, OR
  -- 2. They are admin
  SELECT 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_id AND approval_status = 'approved'
    ) OR
    public.has_role(user_id, 'admin')
$$;

-- Add RLS policies for lease agreements that respect approval status
DROP POLICY IF EXISTS "Users can view their own lease agreements" ON public.lease_agreements;
CREATE POLICY "Users can view their own lease agreements" 
  ON public.lease_agreements 
  FOR SELECT 
  USING (
    auth.uid() = customer_id AND 
    public.can_access_lease_features(auth.uid())
  );

-- Update lease payments policy as well
DROP POLICY IF EXISTS "Users can view their own lease payments" ON public.lease_payments;
CREATE POLICY "Users can view their own lease payments" 
  ON public.lease_payments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.lease_agreements 
      WHERE lease_agreements.id = lease_payments.lease_agreement_id 
      AND lease_agreements.customer_id = auth.uid()
    ) AND
    public.can_access_lease_features(auth.uid())
  );
