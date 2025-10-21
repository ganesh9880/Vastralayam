-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories 
  FOR SELECT 
  USING (is_active = true);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  cash_price DECIMAL(10,2) NOT NULL,
  lease_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  images TEXT[],
  sizes TEXT[],
  colors TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, size, color)
);

-- Enable RLS on cart items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own cart items
CREATE POLICY "Users can view their own cart items" 
  ON public.cart_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items" 
  ON public.cart_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update their own cart items" 
  ON public.cart_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items" 
  ON public.cart_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'lease')),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = customer_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view order items for their orders
CREATE POLICY "Users can view their own order items" 
  ON public.order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- Create lease agreements table
CREATE TABLE public.lease_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  monthly_amount DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  next_payment_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on lease agreements
ALTER TABLE public.lease_agreements ENABLE ROW LEVEL SECURITY;

-- Users can view their own lease agreements
CREATE POLICY "Users can view their own lease agreements" 
  ON public.lease_agreements 
  FOR SELECT 
  USING (auth.uid() = customer_id);

-- Create lease payments table
CREATE TABLE public.lease_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_agreement_id UUID REFERENCES public.lease_agreements(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on lease payments
ALTER TABLE public.lease_payments ENABLE ROW LEVEL SECURITY;

-- Users can view payments for their lease agreements
CREATE POLICY "Users can view their own lease payments" 
  ON public.lease_payments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.lease_agreements 
      WHERE lease_agreements.id = lease_payments.lease_agreement_id 
      AND lease_agreements.customer_id = auth.uid()
    )
  );

-- Add update triggers for timestamps
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lease_agreements_updated_at
  BEFORE UPDATE ON public.lease_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Sarees', 'sarees', 'Elegant traditional sarees for all occasions'),
  ('Kids Wear', 'kids', 'Comfortable and stylish clothing for children'),
  ('Mens Wear', 'mens', 'Formal and casual wear for men'),
  ('Festive', 'festive', 'Special occasion outfits and festive collections');