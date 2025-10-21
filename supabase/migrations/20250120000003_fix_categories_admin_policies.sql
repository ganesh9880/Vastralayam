-- Fix categories admin policies to ensure consistency
-- The update policy was missing the ::app_role cast

-- Drop the existing update policy
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;

-- Recreate the update policy with proper role casting
CREATE POLICY "Admins can update categories"
  ON public.categories
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also ensure the insert policy has the correct casting
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;

CREATE POLICY "Admins can insert categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure admins can view all categories (including inactive ones)
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;

CREATE POLICY "Admins can view all categories"
  ON public.categories
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
