-- Fix lease_agreements table to allow NULL order_id for past customers
-- This allows admins to create lease agreements for past customers without orders

-- Make order_id nullable for past customers
ALTER TABLE public.lease_agreements 
ALTER COLUMN order_id DROP NOT NULL;

-- Ensure admin policies are working correctly
-- Drop and recreate the insert policy to be more explicit
DROP POLICY IF EXISTS "Admins can insert lease agreements" ON public.lease_agreements;

CREATE POLICY "Admins can insert lease agreements"
  ON public.lease_agreements
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also allow users to insert their own lease agreements (for when admin creates them)
CREATE POLICY "Users can insert their own lease agreements"
  ON public.lease_agreements
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);
