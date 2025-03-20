import { motion } from "framer-motion";
import { BookImage, Calendar, MapPin, Tag } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { cn, makeTwoDecimals } from "@/lib/utils";
import { useState } from "react";
import { AnimatedCardProps } from "@/type/type 2";
import { Button } from "../ui/button";
import { isPast } from "date-fns";
import { useConfig } from "@/hooks/useConfig";

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
  sales_price,
  compareAtPrice,
  variant_id,
  product_variants,
  points,
  type,
  validDate,
  isSelected = false,
  gallery_link,
  imageClassName,
  onClick,
  end_datetime,
  isProduct,
  isBanner,
}: AnimatedCardProps) {
  const t = useTranslate();
  const { config } = useConfig();
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

    // Find variants with compare_at_price
    const variantsWithComparePrice = product_variants.filter(
      (v) => v.compare_at_price && v.compare_at_price > 0
    );

    if (variantsWithComparePrice.length > 0) {
      // Get the variant with lowest price among those with compare_at_price
      const lowestPriceVariant = variantsWithComparePrice.reduce(
        (lowest, current) => (current.price < lowest.price ? current : lowest)
      );
      return lowestPriceVariant.price === 0
        ? t("free")
        : `฿${makeTwoDecimals(lowestPriceVariant.price).toLocaleString()}`;
    }

    // If no variants with compare price, show the lowest price among all variants
    const prices = product_variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    return minPrice === 0
      ? t("free")
      : `฿${makeTwoDecimals(minPrice).toLocaleString()}`;
  };

  const getCompareAtPriceDisplay = () => {
    if (selectedVariant && selectedVariant.compare_at_price) {
      return `฿${selectedVariant.compare_at_price.toLocaleString()}`;
    }

    if (!product_variants || product_variants.length === 0) {
      return null;
    }

    // Find variants with compare_at_price
    const variantsWithComparePrice = product_variants.filter(
      (v) => v.compare_at_price && v.compare_at_price > 0
    );

    if (variantsWithComparePrice.length > 0) {
      // Get the variant with lowest price among those with compare_at_price
      const lowestPriceVariant = variantsWithComparePrice.reduce(
        (lowest, current) => (current.price < lowest.price ? current : lowest)
      );
      return `฿${lowestPriceVariant.compare_at_price!.toLocaleString()}`;
    }

    return null;
  };

  const isEventEnded = end_datetime ? isPast(new Date(end_datetime)) : false;

  return (
    <motion.div
      layoutId={`card-${id}`}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer w-full h-full border border-input",
        "transition-all duration-200 hover:scale-[0.98] active:scale-[0.97] text-sm",
        { "!opacity-60": isEventEnded },
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
          { "flex items-center justify-center bg-black": !image },
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
          <div className="flex items-center justify-center h-full">
            {config?.storeLogo ? (
              <img src={config.storeLogo} alt="Store Logo" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-lg" />
            )}
          </div>
        )}

        {/* This button is not clickable, it is used to identify that there is a gallery in this product card, but there will be a 'view gallery' button to click to another link on the single product page */}
        {gallery_link && (
          <Button className="main-btn w-8 max-h-8 p-0 absolute right-4 bottom-4">
            <BookImage className="w-4 h-4" />
          </Button>
        )}

        {product_variants &&
          product_variants.some(
            (variant) =>
              variant.compare_at_price && variant.compare_at_price > 0
          ) && (
            <span className="absolute left-2 top-2 bg-red-500 text-white text-sm rounded-full px-2 py-0.5">
              Sale
            </span>
          )}
      </motion.div>

      <div
        className={cn(
          "p-4 space-y-2",
          type === "event" ? "flex-1 absolute bottom-0" : "bg-card",
          isBanner ? "hidden" : ""
        )}
      >
        <div
          className={`flex flex-col ${
            description ? "gap-2" : "gap-7"
          } justify-between h-fit`}
        >
          <div>
            <motion.div
              layoutId={`title-${id}`}
              className="flex items-center justify-between"
              transition={springConfig}
            >
              <h3 className="font-semibold text-foreground line-clamp-1 text-base">
                {title}
              </h3>
              {isEventEnded && (
                <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium dark:bg-[#8E8E93]/10 dark:text-[#8E8E93] bg-[#BEBEC1] text-white">
                  {t("Ended")}
                </div>
              )}
            </motion.div>

            {isProduct && (
              <motion.p
                layoutId={`desc-${id}`}
                className="text-sm text-muted-foreground line-clamp-1"
                transition={springConfig}
              >
                {description}
              </motion.p>
            )}
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
            {!isProduct && (
              <>
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
                  <span className="line-clamp-1">
                    {date || "To be determined"}
                  </span>
                </motion.div>
              </>
            )}
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

                  {getCompareAtPriceDisplay() && (
                    <span className="text-muted-foreground text-base line-through leading-[26px]">
                      {getCompareAtPriceDisplay()}
                    </span>
                  )}
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
