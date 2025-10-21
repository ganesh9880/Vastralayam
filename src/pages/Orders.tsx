import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(name, images))")
        .eq("customer_id", user?.id)
        .order("order_date", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return colors[status] || "secondary";
  };

  if (loading) {
    return (
      <PageLayout>
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container>
        <h1 className="text-2xl font-heading font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading font-semibold mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground">
                Your orders will appear here once you make a purchase
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(order.status) as any}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {order.order_items.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="w-12 h-12 bg-muted rounded overflow-hidden">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs">
                            👗
                          </div>
                        )}
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{order.order_items.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-primary">
                        ₹{order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  );
};

export default Orders;
