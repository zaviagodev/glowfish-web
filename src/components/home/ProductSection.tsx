import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Product } from "@/hooks/useProducts";
import { memo, useEffect, useState } from "react";

interface ProductSectionProps {
  title: string;
  linkTo: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  sliderRef: React.RefObject<HTMLDivElement>;
}

export const ProductSection = memo(function ProductSection({ 
  title, 
  linkTo, 
  products, 
  onProductSelect, 
  sliderRef 
}: ProductSectionProps) {
  const t = useTranslate();
  const [showControls, setShowControls] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visibility after a small delay to ensure proper rendering
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Check if content is scrollable
    const checkScrollable = () => {
      if (sliderRef.current) {
        setShowControls(sliderRef.current.scrollWidth > sliderRef.current.clientWidth);
      }
    };

    checkScrollable();
    // Add resize listener
    window.addEventListener('resize', checkScrollable);
    return () => {
      window.removeEventListener('resize', checkScrollable);
      clearTimeout(timer);
    };
  }, [products]);

  const getPriceDisplay = (product: Product) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0 ? t("free") : `฿${product.price.toLocaleString()}`;
    }

    if (product.product_variants.length === 1) {
      return `฿${product.product_variants[0].price.toLocaleString()}`;
    }

    const prices = product.product_variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `฿${minPrice.toLocaleString()}`;
    }

    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div 
      className="space-y-4 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link to={linkTo} className="text-sm text-muted-foreground hover:text-foreground">
          {t("See all")}
        </Link>
      </div>

      <div className="relative group">
        {showControls && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border shadow-md"
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px]"
              onClick={() => onProductSelect(product)}
            >
              <AnimatedCard
                id={product.id}
                image={product.image}
                title={product.name}
                price={getPriceDisplay(product)}
              />
            </div>
          ))}
        </div>

        {showControls && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border shadow-md"
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});