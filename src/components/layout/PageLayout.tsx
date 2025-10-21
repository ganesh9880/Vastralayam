import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingActionButton } from "./FloatingActionButton";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  showFAB?: boolean;
  className?: string;
}

export const PageLayout = ({
  children,
  showHeader = true,
  showBottomNav = true,
  showFAB = false,
  className,
}: PageLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showHeader && <Header />}
      
      <main className={cn("flex-1 pb-20", !showBottomNav && "pb-6", className)}>
        {children}
      </main>

      {showFAB && <FloatingActionButton />}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};
