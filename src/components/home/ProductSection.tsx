import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Product } from "@/hooks/useProducts";
import { memo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import EventCard from "../main/EventCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  sliderRef,
}: ProductSectionProps) {
  const t = useTranslate();

  return (
    <div className="space-y-4 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Link
          to={linkTo}
          className="text-sm text-muted-foreground hover:text-foreground no-underline"
        >
          {t("See all")}
        </Link>
      </div>

      <div
        ref={sliderRef}
        className={cn(
          "flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5",
          "scroll-smooth"
        )}
      >
        {products.slice(0, 4).map((product) => (
          <motion.div
            key={product.id}
            className="flex-shrink-0 w-[280px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EventCard {...product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
});
