import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Product } from "@/features/home/hooks/useProducts";
import { memo } from "react";
import { cn, formattedDateAndTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { StickyNote } from "lucide-react";
import NoItemsComp from "@/components/ui/no-items";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeletons";

interface ProductSectionProps {
  title: string;
  linkTo: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  sliderRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
  isProduct?: boolean;
  isBanner?: boolean;
}

const formattedStartDate = (product: Product) => {
  return (
    product?.start_datetime &&
    `${format(
      toZonedTime(new Date(product.start_datetime), "UTC"),
      formattedDateAndTime
    )}`
  );
};

export const ProductSection = memo(function ProductSection({
  title,
  linkTo,
  products,
  onProductSelect,
  sliderRef,
  isLoading,
  isProduct,
  isBanner = false,
}: ProductSectionProps) {
  const t = useTranslate();
  return (
    <div className="space-y-4 px-5">
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Link
              key={`${title}-see-all`}
              to={linkTo}
              className="text-sm text-muted-foreground no-underline"
            >
              {t("See all")}
            </Link>
          </div>
          {products?.length > 0 ? (
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
                  className={cn("flex-shrink-0 w-[200px]", {
                    "h-full": isBanner,
                  })}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => onProductSelect(product)}
                >
                  <AnimatedCard
                    id={product.id}
                    image={product.image}
                    title={product.name}
                    description={product.description}
                    price={product.price}
                    location={product.location}
                    product_variants={product.product_variants}
                    gallery_link={product.gallery_link}
                    date={formattedStartDate(product)}
                    hasGallery={
                      product.gallery_link !== "" &&
                      product.gallery_link !== null
                    }
                    end_datetime={product.end_datetime}
                    isProduct={isProduct}
                    isBanner={isBanner}
                    track_quantity={product.track_quantity}
                    quantity={product.product_variants.reduce(
                      (acc, variant) =>
                        acc + variant.quantity === null ? 0 : variant.quantity,
                      0
                    )}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <NoItemsComp icon={StickyNote} text="No products found" />
          )}
        </>
      )}
    </div>
  );
});
