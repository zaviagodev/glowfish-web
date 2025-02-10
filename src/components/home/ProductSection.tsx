import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Product } from "@/hooks/useProducts";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface ProductSectionProps {
  title: string;
  linkTo: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  sliderRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
}

export const ProductSection = memo(function ProductSection({
  title,
  linkTo,
  products,
  onProductSelect,
  sliderRef,
  isLoading,
}: ProductSectionProps) {
  const t = useTranslate();

  return (
    <div className="space-y-4 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link
          to={linkTo}
          className="text-sm text-[#FAFAFACC] hover:text-foreground no-underline"
        >
          {t("See all")}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div
          ref={sliderRef}
          className={cn(
            "flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5",
            "scroll-smooth"
          )}
        >
          {products.map((product) => (
            <motion.div
              key={product.name}
              className="flex-shrink-0 w-[360px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => onProductSelect(product)}
            >
              <AnimatedCard
                id={product.id}
                image={product.image}
                title={product.name}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                location={product.location}
                product_variants={product.product_variants}
                date={
                  product.start_datetime &&
                  format(
                    toZonedTime(new Date(product.start_datetime), "UTC"),
                    "dd/MM/yyyy, hh:mm a"
                  )
                }
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});
