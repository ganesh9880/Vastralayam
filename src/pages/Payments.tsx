import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, DollarSign, TrendingDown, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const Payments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [leaseHistory, setLeaseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load profile with overall balance
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load lease history only if user is approved
      if (profileData?.approval_status === 'approved') {
        const { data: leasesData, error: leasesError } = await supabase
          .from("lease_agreements")
          .select("*, order:orders(id, order_date)")
          .eq("customer_id", user?.id)
          .order("created_at", { ascending: false });

        if (leasesError) throw leasesError;
        setLeaseHistory(leasesData || []);
      } else {
        setLeaseHistory([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      completed: "secondary",
      defaulted: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <PageLayout>
        <Container>
          <h1 className="text-2xl font-heading font-bold mb-6">Lease Payments</h1>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  const overallBalance = profile?.overall_lease_balance || 0;

  return (
    <PageLayout>
      <Container>
        <h1 className="text-2xl font-heading font-bold mb-6">Lease Payments</h1>
        
        {/* Overall Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Overall Lease Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                ₹{overallBalance.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total outstanding amount across all leases
            </p>
            {overallBalance > 0 && (
              <div className="mt-4 p-3 bg-background rounded-md">
                <p className="text-xs text-muted-foreground">
                  Contact the store to make payments and reduce your balance
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lease History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Lease History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaseHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-heading font-semibold mb-2">No lease records</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.approval_status === 'approved' 
                    ? "Your lease purchase history will appear here" 
                    : "Lease features require admin approval. Contact support for access to lease options."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaseHistory.map((lease, index) => (
                  <div key={lease.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">
                            Lease #{lease.id.slice(0, 8)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Order Date: {new Date(lease.order?.order_date).toLocaleDateString()}
                          </div>
                        </div>
                        {getStatusBadge(lease.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs">Lease Amount</div>
                          <div className="font-semibold">₹{lease.total_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Monthly Payment</div>
                          <div className="font-semibold">₹{lease.monthly_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Remaining</div>
                          <div className="font-semibold text-primary">
                            ₹{lease.remaining_balance.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Settlement Status</div>
                          <Badge variant={lease.is_settled ? "secondary" : "default"} className="text-xs">
                            {lease.is_settled ? "Settled" : "Active"}
                          </Badge>
                        </div>
                      </div>

                      {lease.next_payment_date && !lease.is_settled && (
                        <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Next payment due: {new Date(lease.next_payment_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default Payments;
