-- Add overall lease balance to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS overall_lease_balance numeric DEFAULT 0;

-- Update lease_agreements to track individual lease records
ALTER TABLE public.lease_agreements 
ADD COLUMN IF NOT EXISTS is_settled boolean DEFAULT false;

-- Add category management permission
CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));