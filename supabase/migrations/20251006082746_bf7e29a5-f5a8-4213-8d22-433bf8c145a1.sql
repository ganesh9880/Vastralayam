-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add admin policies for products table
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for categories
CREATE POLICY "Admins can insert categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for orders (viewing and updating status)
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for profiles (to manage customer approvals)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for order items
CREATE POLICY "Admins can view all order items"
  ON public.order_items
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for lease agreements
CREATE POLICY "Admins can view all lease agreements"
  ON public.lease_agreements
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lease agreements"
  ON public.lease_agreements
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert lease agreements"
  ON public.lease_agreements
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for lease payments
CREATE POLICY "Admins can view all lease payments"
  ON public.lease_payments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert lease payments"
  ON public.lease_payments
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to automatically assign customer role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

-- Trigger to assign customer role on user creation
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();