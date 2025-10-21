import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  cashPrice: number;
  leasePrice?: number;
  image?: string;
  stockQuantity: number;
  onAddToCart?: () => void;
}

export const ProductCard = ({
  id,
  name,
  cashPrice,
  leasePrice,
  image,
  stockQuantity,
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const isOutOfStock = stockQuantity === 0;

  return (
    <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg">
      <div onClick={() => navigate(`/product/${id}`)}>
        <div className="aspect-square bg-muted relative">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl">👗</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-heading font-semibold mb-2 line-clamp-2">{name}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-primary">
              ₹{cashPrice.toFixed(2)}
            </p>
            {leasePrice && (
              <p className="text-xs text-muted-foreground">
                or ₹{leasePrice.toFixed(2)}/month
              </p>
            )}
          </div>
          {!isOutOfStock && (
            <Badge variant="secondary" className="text-xs">
              {stockQuantity} in stock
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          className="w-full"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};
