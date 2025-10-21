import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [
        { count: productsCount },
        { count: ordersCount },
        { data: pendingOrders },
        { count: customersCount },
        { data: pendingCustomers },
        { data: orders }
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id").eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("id").eq("approval_status", "pending"),
        supabase.from("orders").select("total_amount"),
      ]);

      const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        pendingOrders: pendingOrders?.length || 0,
        totalCustomers: customersCount || 0,
        pendingApprovals: pendingCustomers?.length || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      subtitle: `${stats.pendingApprovals} awaiting approval`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent orders and customer activities will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
