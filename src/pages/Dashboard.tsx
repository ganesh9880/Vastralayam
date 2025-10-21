import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CreditCard, Package, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { name: "Sarees", path: "/categories/sarees", emoji: "👘" },
  { name: "Kids Wear", path: "/categories/kids", emoji: "👶" },
  { name: "Men's Wear", path: "/categories/mens", emoji: "👔" },
  { name: "Festive", path: "/categories/festive", emoji: "✨" },
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PageLayout>
        <Container>
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </Container>
      </PageLayout>
    );
  }

  const isPending = profile?.approval_status === "pending";

  return (
    <PageLayout>
      <Container>
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-1">
            Welcome, {profile?.full_name || "Guest"}!
          </h1>
          <p className="text-muted-foreground">
            Discover our collection of traditional wear and start shopping today!
          </p>
        </div>

        {!isPending && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  Welcome to Lakshmi Vastralayam! Your account is active and you can start shopping right away.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => !isPending && navigate("/categories")}
            disabled={isPending}
          >
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Browse</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => !isPending && navigate("/orders")}
            disabled={isPending}
          >
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Orders</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => !isPending && navigate("/payments")}
            disabled={isPending}
          >
            <CreditCard className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Payments</span>
          </Button>
        </div>

        {/* Current Offers Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <h3 className="font-heading font-semibold text-lg mb-1">
              Festival Special Offers! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">
              Get up to 30% off on festive collections
            </p>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div>
          <h2 className="text-xl font-heading font-semibold mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                onClick={() => !isPending && navigate(category.path)}
              >
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <span className="text-4xl mb-2">{category.emoji}</span>
                  <h3 className="font-heading font-semibold text-center">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </PageLayout>
  );
};

export default Dashboard;
