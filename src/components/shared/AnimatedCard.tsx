import { motion } from "framer-motion";
import {
  BookImage,
  Calendar,
  Images,
  Layers2,
  MapPin,
  Tag,
} from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProductVariant } from "@/type/type";
import GlowfishIcon from "../icons/GlowfishIcon";
import { Button } from "../ui/button";

interface AnimatedCardProps {
  id: string | number;
  image: string;
  title: string;
  description?: string;
  location?: string;
  date?: string;
  price?: string | number;
  compareAtPrice?: string | number;
  variant_id?: string;
  product_variants?: ProductVariant[];
  points?: string | number;
  type?: "small" | "event";
  validDate?: string;
  isSelected?: boolean;
  hasGallery?: boolean;
  imageClassName?: string;
  onClick?: () => void;
}

const springConfig = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 0.8,
};

export function AnimatedCard({
  id,
  image,
  title,
  description,
  location,
  date,
  price,
  compareAtPrice,
  variant_id,
  product_variants,
  points,
  type,
  validDate,
  isSelected = false,
  hasGallery,
  imageClassName,
  onClick,
}: AnimatedCardProps) {
  const t = useTranslate();
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(variant_id);

  // Find selected variant
  const selectedVariant = product_variants?.find(
    (v) => v.id === selectedVariantId
  );

  const getPriceDisplay = () => {
    if (selectedVariant) {
      return selectedVariant.price === 0
        ? t("free")
        : `฿${selectedVariant.price.toLocaleString()}`;
    }

    if (!product_variants || product_variants.length === 0) {
      return price === 0 ? t("free") : `฿${Number(price).toLocaleString()}`;
    }

    const prices = product_variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      // return `฿${minPrice.toLocaleString()}`;
      return minPrice === 0 ? t("free") : `฿${minPrice.toLocaleString()}`;
    }

    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  return (
    <motion.div
      layoutId={`card-${id}`}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer w-full h-full border border-input",
        "transition-all duration-200 hover:scale-[0.98] active:scale-[0.97] text-sm",
        type === "event" && "flex h-fit"
      )}
      transition={springConfig}
    >
      <motion.div
        layoutId={`image-container-${id}`}
        className={cn(
          "relative overflow-hidden",
          type === "small"
            ? "h-[32vw] w-full"
            : "max-h-[300px] h-[60vw] w-full",
          type === "event" && "w-[125px] min-w-[125px]",
          { "flex items-center justify-center bg-white/20": !image },
          imageClassName
        )}
        transition={springConfig}
      >
        {image ? (
          <motion.img
            layoutId={`image-${id}`}
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top"
            transition={springConfig}
          />
        ) : (
          <GlowfishIcon />
        )}

        {/* This button is not clickable, it is used to identify that there is a gallery in this product card, but there will be a 'view gallery' button to click to another link on the single product page */}
        {hasGallery && (
          <Button className="main-btn w-8 h-8 p-0 absolute right-4 top-4">
            <BookImage className="w-4 h-4" />
          </Button>
        )}
      </motion.div>

      <div
        className={cn(
          "p-4 space-y-2",
          type === "event" ? "flex-1 absolute bottom-0" : "bg-card"
        )}
      >
        <div className="space-y-2">
          <div>
            <motion.h3
              layoutId={`title-${id}`}
              className="font-semibold text-foreground line-clamp-1 text-base"
              transition={springConfig}
            >
              {title}
            </motion.h3>

            {/* <motion.p
              layoutId={`desc-${id}`}
              className="text-sm text-muted-foreground line-clamp-1"
              transition={springConfig}
            >
              {description}
            </motion.p> */}
          </div>

          {/* {price ? (
            <motion.p
              layoutId={`price-${id}`}
              className="space-y-0.5"
              transition={springConfig}
            >
              <span className="flex items-baseline gap-2 text-lg font-semibold">
                <span className={cn("text-secondary-foreground")}>
                  ฿{typeof price === "number" ? price.toLocaleString() : price}
                </span>
                {compareAtPrice && (
                  <span className="text-xs line-through text-[#999999]">
                    ฿
                    {typeof compareAtPrice === "number"
                      ? compareAtPrice.toLocaleString()
                      : compareAtPrice}
                  </span>
                )}
              </span>
              {compareAtPrice && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-mainbutton/10">
                  {Math.round(
                    (1 - Number(price) / Number(compareAtPrice)) * 100
                  )}
                  % OFF
                </span>
              )}
            </motion.p>
          ) : (
            <p className="text-lg font-semibold space-y-0.5">Free</p>
          )} */}

          <div className="space-y-2">
            <motion.div
              layoutId={`location-${id}`}
              className="flex items-center gap-2 text-xs text-muted-foreground"
              transition={springConfig}
            >
              <MapPin className="min-w-3.5 w-3.5 h-3.5" />
              <span className="line-clamp-1">
                {location || "To be determined"}
              </span>
            </motion.div>
            <motion.div
              layoutId={`date-${id}`}
              className="flex items-center gap-2 text-xs text-muted-foreground"
              transition={springConfig}
            >
              <Calendar className="min-w-3.5 w-3.5 h-3.5" />
              <span className="line-clamp-1">{date || "To be determined"}</span>
            </motion.div>
            {points && (
              <motion.div
                layoutId={`points-${id}`}
                className="flex items-center gap-2 text-xs text-muted-foreground"
                transition={springConfig}
              >
                <Tag className="min-w-3.5 w-3.5 h-3.5" />
                <span className="line-clamp-1">
                  {t("point", { count: points })}
                </span>
              </motion.div>
            )}

            {getPriceDisplay() && (
              <motion.p
                layoutId={`price-${id}`}
                className="space-y-0.5"
                transition={springConfig}
              >
                <span className="flex items-baseline gap-2 text-lg font-semibold">
                  {getPriceDisplay()}
                </span>
              </motion.p>
            )}
          </div>
        </div>

        {validDate && (
          <p className="text-xs text-muted-foreground">
            {t("Valid to")} {validDate}
          </p>
        )}
      </div>
    </motion.div>
  );
}
