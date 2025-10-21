import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Layers,
  UserPlus
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: Layers, label: "Categories", path: "/admin/categories" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: UserPlus, label: "Add Past Customer", path: "/admin/add-past-customer" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-background h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-heading font-bold text-primary">
          Admin Panel
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Lakshmi Vastralayam
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
