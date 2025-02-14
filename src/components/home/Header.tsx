import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useTranslate } from "@refinedev/core";

interface HeaderProps {
  onSearchClick: () => void;
}

export function Header({ onSearchClick }: HeaderProps) {
  const t = useTranslate();
  const cartItemCount = useCart((state) => state.getTotalItems());

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="max-w-[500px] mx-auto">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="outline"
            role="combobox"
            className="flex-1 justify-between h-10 bg-white border-[#E5E5E5] text-black rounded-full shadow-sm"
            onClick={onSearchClick}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-black/60" />
              <span className="text-black/60">{t("Search products...")}</span>
            </div>
          </Button>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] rounded-full flex items-center justify-center">
                {cartItemCount}
              </div>
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/support">
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
