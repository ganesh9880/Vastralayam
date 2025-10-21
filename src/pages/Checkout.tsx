import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "lease">("cash");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    loadProfile();
  }, [user, items]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setAddress(data.address || "");
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter delivery address");
      return;
    }

    // Prevent lease payments for non-approved users
    if (paymentType === "lease" && profile?.approval_status !== 'approved') {
      toast.error("Lease payments require admin approval. Please contact support.");
      return;
    }

    setPlacing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user?.id,
          payment_type: paymentType,
          total_amount: totalAmount,
          delivery_address: address,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.cash_price,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If lease payment, create lease agreement and update overall balance
      if (paymentType === "lease") {
        const leaseAmount = totalAmount * 1.1;
        const monthlyAmount = leaseAmount / 12;

        // Create lease agreement record
        const { error: leaseError } = await supabase
          .from("lease_agreements")
          .insert({
            customer_id: user?.id,
            order_id: order.id,
            total_amount: leaseAmount,
            monthly_amount: monthlyAmount,
            remaining_balance: leaseAmount,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "active",
            is_settled: false,
          });

        if (leaseError) throw leaseError;

        // Update overall lease balance
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("overall_lease_balance")
          .eq("id", user?.id)
          .single();

        const newBalance = (currentProfile?.overall_lease_balance || 0) + leaseAmount;
        
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ overall_lease_balance: newBalance })
          .eq("id", user?.id);

        if (updateError) throw updateError;
      }

      // Clear cart
      await clearCart();

      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <PageLayout showBottomNav={false}>
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  const leaseAmount = totalAmount * 1.1; // 10% markup for lease
  const monthlyAmount = leaseAmount / 12;

  return (
    <PageLayout showBottomNav={false}>
      <Container className="pb-32">
        <h1 className="text-2xl font-heading font-bold mb-6">Checkout</h1>

        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{(item.product.cash_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentType} onValueChange={(v: any) => setPaymentType(v)}>
                <div className="flex items-start space-x-3 rounded-md border p-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <div className="flex-1">
                    <Label htmlFor="cash" className="font-semibold cursor-pointer">
                      Cash on Delivery
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay ₹{totalAmount.toFixed(2)} when you receive your order
                    </p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 rounded-md border p-4 ${profile?.approval_status !== 'approved' ? 'opacity-50' : ''}`}>
                  <RadioGroupItem 
                    value="lease" 
                    id="lease" 
                    disabled={profile?.approval_status !== 'approved'}
                  />
                  <div className="flex-1">
                    <Label htmlFor="lease" className={`font-semibold ${profile?.approval_status !== 'approved' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      Lease Payment
                      {profile?.approval_status !== 'approved' && (
                        <span className="text-xs text-muted-foreground ml-2">(Requires admin approval)</span>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay ₹{monthlyAmount.toFixed(2)}/month for 12 months
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: ₹{leaseAmount.toFixed(2)}
                    </p>
                    {profile?.approval_status !== 'approved' && (
                      <p className="text-xs text-orange-600 mt-1">
                        Contact support to enable lease payment options
                      </p>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Place Order Button - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <Container>
            <div className="py-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ₹${totalAmount.toFixed(2)}`
                )}
              </Button>
            </div>
          </Container>
        </div>
      </Container>
    </PageLayout>
  );
};

export default Checkout;
