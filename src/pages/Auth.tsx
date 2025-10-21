import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { MapPin } from "lucide-react";

const loginSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
});

const Auth = () => {
  const { signIn, signUp, user, checkAdminRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [address, setAddress] = useState("");

  // Redirect if already authenticated
  if (user) {
    // Check if user is admin and redirect accordingly
    checkAdminRole().then((isAdmin) => {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    });
    return null;
  }

  const handleGetLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) throw new Error("Failed to get address");
          
          const data = await response.json();
          const detectedAddress = data.display_name || `${latitude}, ${longitude}`;
          
          setAddress(detectedAddress);
          toast.success("Location detected successfully!");
        } catch (error) {
          toast.error("Failed to get address. Please enter manually.");
          console.error("Geocoding error:", error);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        toast.error("Failed to get your location. Please enter address manually.");
        console.error("Geolocation error:", error);
        setGettingLocation(false);
      }
    );
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;

    try {
      loginSchema.parse({ phoneNumber, password });
      // Use phone number as email format for Supabase auth
      const email = `${phoneNumber}@lakshmi.app`;
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || "Login failed");
      } else {
        // Check if user is admin and redirect accordingly
        setTimeout(async () => {
          const isAdmin = await checkAdminRole();
          if (isAdmin) {
            toast.success("Welcome back, Admin!");
            navigate("/admin");
          } else {
            toast.success("Welcome back!");
            navigate("/dashboard");
          }
        }, 100);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const address = formData.get("address") as string;

    try {
      signupSchema.parse({ phoneNumber, password, fullName, address });
      
      // Use phone number as email format for Supabase auth
      const email = `${phoneNumber}@lakshmi.app`;
      const { error } = await signUp(email, password, {
        phoneNumber,
        fullName,
        address,
      });

      if (error) {
        toast.error(error.message || "Registration failed");
      } else {
        toast.success("Registration successful! Your account has been automatically approved. You can now start shopping!");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">
            Lakshmi Vastralayam
          </h1>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Phone Number</Label>
                  <Input
                    id="login-phone"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                    className="touch-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="touch-target"
                  />
                </div>
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                    className="touch-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    required
                    className="touch-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="touch-target"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address">Address</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="h-8"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      {gettingLocation ? "Detecting..." : "Auto-detect"}
                    </Button>
                  </div>
                  <Textarea
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address or use auto-detect"
                    required
                    className="touch-target"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
