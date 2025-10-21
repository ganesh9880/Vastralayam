import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

interface FloatingActionButtonProps {
  className?: string;
}

export const FloatingActionButton = ({
  className,
}: FloatingActionButtonProps) => {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <Link
      to="/cart"
      className={cn(
        "fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95",
        className
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-6 w-6" />
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
        {itemCount}
      </span>
    </Link>
  );
};
