import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profile:profiles(full_name, phone_number),
          order_items(*, product:products(name, images))
        `)
        .order("order_date", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast.success("Order status updated");
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Failed to update order");
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
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
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Orders Management</h2>
          <p className="text-muted-foreground mt-1">
            View and manage customer orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading font-semibold mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground">
                Orders will appear here once customers start placing them
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <Collapsible
                  open={expandedOrders.has(order.id)}
                  onOpenChange={() => toggleOrder(order.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.profile?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.order_date).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-sm font-bold text-primary">
                            ₹{order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.payment_type}
                          </p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {expandedOrders.has(order.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="space-y-4">
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex gap-3 text-sm">
                              <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0] ? (
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
                              <div className="flex-1">
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Delivery Address</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.delivery_address}
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <Label className="text-sm font-semibold mb-2 block">
                          Update Status
                        </Label>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
