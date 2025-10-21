import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  pendingApprovals: number;
  totalRevenue: number;
  totalLeaseBalance: number;
  activeProducts: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load all analytics data
      const { data: orders } = await supabase.from("orders").select("*");
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: products } = await supabase.from("products").select("*").eq("is_active", true);

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalLeaseBalance = profiles?.reduce((sum, profile) => sum + Number(profile.overall_lease_balance || 0), 0) || 0;

      setAnalytics({
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
        totalCustomers: profiles?.filter(p => p.approval_status === 'approved').length || 0,
        pendingApprovals: profiles?.filter(p => p.approval_status === 'pending').length || 0,
        totalRevenue,
        totalLeaseBalance,
        activeProducts: products?.length || 0,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-heading font-bold">Analytics & Reports</h2>
            <p className="text-muted-foreground mt-1">Business insights and metrics</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Analytics & Reports</h2>
          <p className="text-muted-foreground mt-1">Business insights and performance metrics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics?.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From all orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Lease Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics?.totalLeaseBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total outstanding</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalOrders}</div>
              <p className="text-xs text-muted-foreground">{analytics?.pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Approved accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.activeProducts}</div>
              <p className="text-xs text-muted-foreground">In catalog</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
