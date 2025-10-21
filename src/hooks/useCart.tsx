import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product: {
    name: string;
    cash_price: number;
    lease_price: number;
    images: string[];
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  totalAmount: number;
  addToCart: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products(name, cash_price, lease_price, images, stock_quantity)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number, size?: string, color?: string) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      // Check if item already exists
      const existingItem = items.find(
        item => item.product_id === productId && item.size === size && item.color === color
      );

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            size,
            color,
          });

        if (error) throw error;
        await loadCart();
        toast.success("Added to cart");
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;
      await loadCart();
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast.error(error.message || "Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      await loadCart();
      toast.success("Item removed from cart");
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast.error(error.message || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setItems([]);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      toast.error(error.message || "Failed to clear cart");
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.cash_price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        totalAmount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
