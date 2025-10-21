import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, totalAmount, updateQuantity, removeItem } = useCart();

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <PageLayout showBottomNav={false}>
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PageLayout showBottomNav={false}>
        <Container>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add some items to get started
              </p>
              <Button onClick={() => navigate("/categories")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBottomNav={false}>
      <Container className="pb-32">
        <h1 className="text-2xl font-heading font-bold mb-6">Shopping Cart</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-2xl">👗</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    {(item.size || item.color) && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {[item.size, item.color].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary">
                      ₹{item.product.cash_price.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-semibold">
                    ₹{(item.product.cash_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <Container>
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </div>
          </Container>
        </div>
      </Container>
    </PageLayout>
  );
};

export default Cart;
