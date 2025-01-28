import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Product } from "@/hooks/useProducts";
import { memo } from "react";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link to={linkTo} className="text-sm text-muted-foreground hover:text-foreground">
          {t("See all")}
        </Link>
      </div>

      <div className="relative group -mx-5 px-5">
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border"
          onClick={() => {
            if (sliderRef.current) {
              sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div 
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[300px]"
              onClick={() => onProductSelect(product)}
            >
              <AnimatedCard
                id={product.id}
                image={product.image}
                title={product.name}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                description={product.description}
              />
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border"
          onClick={() => {
            if (sliderRef.current) {
              sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});