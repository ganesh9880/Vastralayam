import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import ProductForm from "./pages/admin/ProductForm";
import OrdersManagement from "./pages/admin/OrdersManagement";
import CustomersManagement from "./pages/admin/CustomersManagement";
import AddPastCustomer from "./pages/admin/AddPastCustomer";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductsManagement />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id" element={<ProductForm />} />
            <Route path="/admin/orders" element={<OrdersManagement />} />
            <Route path="/admin/customers" element={<CustomersManagement />} />
            <Route path="/admin/add-past-customer" element={<AddPastCustomer />} />
            <Route path="/admin/categories" element={<CategoriesManagement />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
