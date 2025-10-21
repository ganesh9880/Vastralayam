import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Star, Truck, Shield, Heart, Sparkles, ShoppingBag, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Show loading for maximum 2 seconds, then show the page regardless
  const [showPage, setShowPage] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // If still loading after timeout, show the page anyway
  if (loading && !showPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-pink-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">
            Lakshmi Vastralayam
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-blue-100/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Premium Traditional Wear
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-heading font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight animate-fade-in animate-gradient">
            Lakshmi Vastralayam
          </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Discover the perfect blend of tradition and elegance. From exquisite sarees to festive wear, 
                we bring you the finest collection of Indian clothing.
          </p>
        </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user && !loading ? (
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
            >
                  <ShoppingBag className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-bounce hover:animate-none"
              >
                    <Heart className="w-5 h-5 mr-2" />
                    Start Shopping
              </Button>
              <Button
                onClick={() => navigate("/admin/login")}
                size="lg"
                variant="outline"
                    className="px-8 py-4 text-lg font-semibold border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Admin Access
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-slate-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">1000+</div>
                <div className="text-sm text-slate-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-slate-600">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-slate-800 mb-4">
              Why Choose Lakshmi Vastralayam?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We're committed to providing you with the best shopping experience and quality products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-pink-50 to-purple-50">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Authentic Quality</h3>
                <p className="text-slate-600">
                  Every product is carefully curated and authentic, ensuring you get the best quality traditional wear.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Fast Delivery</h3>
                <p className="text-slate-600">
                  Quick and reliable delivery service to bring your favorite outfits right to your doorstep.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-blue-50 to-pink-50">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Expert Service</h3>
                <p className="text-slate-600">
                  Our experienced team helps you find the perfect outfit for every occasion with personalized service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-slate-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore our diverse collection of traditional and modern clothing.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Sarees", emoji: "👘", color: "from-pink-400 to-rose-500" },
              { name: "Kids Wear", emoji: "👶", color: "from-purple-400 to-indigo-500" },
              { name: "Men's Wear", emoji: "👔", color: "from-blue-400 to-cyan-500" },
              { name: "Festive", emoji: "✨", color: "from-yellow-400 to-orange-500" },
            ].map((category) => (
              <Card 
                key={category.name}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-white/80 backdrop-blur-sm"
                onClick={() => navigate("/categories")}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-20 h-20 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                    <span className="text-3xl">{category.emoji}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-slate-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-600">
              Join thousands of satisfied customers who trust us for their traditional wear needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                rating: 5,
                text: "Amazing collection! The sarees are so beautiful and the quality is exceptional. Highly recommended!"
              },
              {
                name: "Rajesh Kumar",
                rating: 5,
                text: "Great service and fast delivery. Found the perfect outfit for my daughter's wedding. Thank you!"
              },
              {
                name: "Sunita Reddy",
                rating: 5,
                text: "Love shopping here! The staff is very helpful and the prices are reasonable. Will definitely come back."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 bg-gradient-to-br from-slate-50 to-purple-50">
                <CardContent className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic">"{testimonial.text}"</p>
                  <div className="font-semibold text-slate-800">- {testimonial.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading font-bold text-white mb-6">
            Ready to Find Your Perfect Outfit?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join our community of fashion lovers and discover your next favorite piece.
          </p>
          {(!user || loading) && (
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Shopping Now
              </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-heading font-bold">Lakshmi Vastralayam</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Your trusted partner for traditional and modern clothing. Bringing you the finest collection 
              with exceptional service for over 15 years.
            </p>
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                © 2024 Lakshmi Vastralayam. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
