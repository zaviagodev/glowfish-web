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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <Link
          to={linkTo}
          className="text-sm text-muted-foreground hover:text-foreground no-underline"
        >
          {t("See all")}
        </Link>
      </div>

      <Carousel>
        <CarouselContent className="px-5">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="flex-shrink-0 w-[300px]"
              onClick={() => onProductSelect(product)}
            >
              {/* <AnimatedCard
                id={product.id}
                image={product.image}
                title={product.name}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                description={product.description}
              /> */}
              <EventCard
                // id={product.id}
                image={product.image}
                title={product.name}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                description={product.description}
                location={product.location}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
});
