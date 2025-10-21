import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Set default selections
      if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Product not found");
      navigate("/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    await addToCart(product.id, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading || !product) {
    return (
      <PageLayout showBottomNav={false}>
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  const isOutOfStock = product.stock_quantity === 0;
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [null];

  return (
    <PageLayout showBottomNav={false}>
      <Container className="pb-24">
        {/* Image Carousel */}
        <Carousel className="mb-6">
          <CarouselContent>
            {images.map((image: string | null, index: number) => (
              <CarouselItem key={index}>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl">👗</span>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category?.name}
            </Badge>
            <h1 className="text-2xl font-heading font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Pricing */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-primary">
                  ₹{product.cash_price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">Cash Price</span>
              </div>
              {product.lease_price && (
                <p className="text-sm text-muted-foreground">
                  or ₹{product.lease_price.toFixed(2)}/month with lease
                </p>
              )}
              {!isOutOfStock && (
                <Badge variant="outline" className="mt-3">
                  {product.stock_quantity} in stock
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="destructive" className="mt-3">
                  Out of Stock
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size: string) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color: string) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={isOutOfStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="container mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              className="flex-1"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
};

export default ProductDetails;
