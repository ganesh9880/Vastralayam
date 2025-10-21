import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

interface HeaderProps {
  showCart?: boolean;
}

export const Header = ({ showCart = true }: HeaderProps) => {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-bold text-primary">
              Lakshmi Vastralayam
            </h1>
            <p className="text-xs text-muted-foreground">Traditional Elegance</p>
          </div>
        </Link>

        {showCart && (
          <Link
            to="/cart"
            className="relative touch-target flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-6 w-6 text-primary" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
};
