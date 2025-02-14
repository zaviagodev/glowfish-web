import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Tag,
  ChevronLeft,
  ShoppingCart,
  Contact,
  Phone,
  BookImage,
  ChevronRight,
} from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart";
import { VariantDrawer } from "./VariantDrawer";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ProductDetailProps } from "@/type/type";
import GlowfishIcon from "../icons/GlowfishIcon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface ProductVariantOption {
  name: string;
  value: string;
}

export function ProductDetail({
  id,
  image,
  name,
  description,
  location,
  venue_address,
  date,
  price,
  points,
  variant_id,
  quantity = 1,
  track_quantity = false,
  onClose,
  variant_options,
  product_variants,
  organizer_name,
  organizer_contact,
  gallery_link,
  hide_cart,
}: ProductDetailProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);
  const { addToast } = useToast();
  const [showVariantDrawer, setShowVariantDrawer] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(variant_id);

  // Find selected variant
  const selectedVariant = product_variants?.find(
    (v) => v.id === selectedVariantId
  );

  // Get price display
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

  // Format variant options for display
  const getSelectedOptionsDisplay = () => {
    if (!selectedVariant) {
      return t("Select Options");
    }
    return selectedVariant.options.map((opt) => opt.value).join(" / ");
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleAddToCart = (toCart: boolean = true) => {
    // Check if product has variants
    if (variant_options && variant_options.length > 0) {
      if (!selectedVariant) {
        setShowVariantDrawer(true);
        return;
      }
    } else if (!selectedVariantId) {
      addToast(t("Please select product options"), "error");
      return;
    }
    // Check stock quantity if tracking is enabled
    const stockQuantity = selectedVariant?.quantity || quantity;
    const shouldTrackQuantity = track_quantity;

    if (shouldTrackQuantity && stockQuantity <= 0) {
      addToast(t("This item is out of stock"), "error");
      return;
    }

    addItem({
      variantId: selectedVariantId!,
      productId: id.toString(),
      name,
      image,
      price: selectedVariant?.price || Number(price),
      maxQuantity: shouldTrackQuantity ? stockQuantity : 999999,
      variant: selectedVariant?.options?.reduce(
        (acc, opt) => ({
          ...acc,
          [opt.name]: opt.value,
        }),
        {}
      ),
    });

    addToast(t("Added to cart"), "success");
    if (toCart) navigate("/cart");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose();
    }
  };

  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (paragraphRef.current) {
      const style = window.getComputedStyle(paragraphRef.current);
      const lineHeight = parseFloat(style.lineHeight);
      const maxHeight = lineHeight * 3;

      setIsClamped(paragraphRef.current.scrollHeight > maxHeight);
    }
  }, [description, venue_address]);

  return createPortal(
    <div className="fixed inset-0 z-50 max-width-mobile bg-background pointer-events-auto">
      <div
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        // transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
        onClick={handleBackdropClick}
      />

      <div
        // layoutId={`card-${id}`}
        // transition={{
        //   layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
        // }}
        className="fixed inset-0 overflow-y-auto bg-background max-width-mobile"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-5 top-5 z-[60] bg-black/20 hover:bg-black/30 text-white"
          onClick={onClose}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        {!hide_cart && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-5 top-5 z-[60] bg-black/20 hover:bg-black/30 text-white"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        )}
        {image ? (
          <div
            // layoutId={`image-container-${id}`}
            className="w-full aspect-square overflow-hidden"
            // transition={{
            //   layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
            // }}
          >
            {/* <img
              // layoutId={`image-${id}`}
              src={image}
              alt={name}
              className="w-full h-full object-cover object-top"
              // transition={{
              //   layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
              // }}
            /> */}
            <Carousel>
              <CarouselContent>
                <CarouselItem>
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover object-top"
                  />
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
        ) : (
          <div
            // layoutId={`image-container-${id}`}
            className="flex items-center justify-center w-full aspect-square overflow-hidden bg-white/20"
            // transition={{
            //   layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
            // }}
          >
            <GlowfishIcon />
          </div>
        )}

        <div className="p-5 space-y-6 bg-background/80 relative z-[99] backdrop-blur-sm rounded-t-2xl overflow-auto pb-48">
          <div className="space-y-4">
            <div className="space-y-2">
              <span
                className={cn(
                  "text-2xl flex flex-col font-bold tracking-tight text-secondary-foreground",
                  { "text-4xl text-orangefocus": getPriceDisplay() === "free" }
                )}
                style={{
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                {getPriceDisplay()}
              </span>
              <h2
                // layoutId={`title-${id}`}
                className="text-2xl"
                // transition={{
                //   layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                // }}
              >
                {name}
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-light">
                  <MapPin className="w-4 h-4" />
                  <span>{location || "To be determined"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-light">
                  <Calendar className="w-4 h-4" />
                  <span>{date || "To be determined"}</span>
                </div>
                {points && (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Tag className="w-4 h-4" />
                    <span>{t("point", { count: points })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* TODO: link to gallery page if the gallery is available
              e.g. product.gallery_link = "https://google.com"
            */}
            {gallery_link && (
              <button
                onClick={() => (window.location.href = gallery_link)}
                className="flex items-center justify-between p-4 rounded-lg bg-darkgray w-full"
              >
                <div className="flex items-center gap-3">
                  <BookImage className="w-5 h-5 text-white" />
                  {t("View gallery")}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            {description && (
              <div className="space-y-2">
                <h2
                  // initial={{ opacity: 0, y: 20 }}
                  // animate={{ opacity: 1, y: 0 }}
                  // transition={{ delay: 0.3 }}
                  className="text-base"
                >
                  {t("Description")}
                </h2>
                <p
                  // initial={{ opacity: 0, y: 20 }}
                  // animate={{ opacity: 1, y: 0 }}
                  // transition={{ delay: 0.4 }}
                  className="text-sm text-secondary-foreground font-light"
                  ref={paragraphRef}
                >
                  <span className={!expanded ? "line-clamp-5" : ""}>
                    {description}
                  </span>

                  {isClamped ? (
                    <p
                      className="text-orangefocus text-sm w-fit"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? "Read less..." : "Read more..."}
                    </p>
                  ) : null}
                </p>
              </div>
            )}

            {venue_address && (
              <div className="space-y-2">
                <h2
                  // initial={{ opacity: 0, y: 20 }}
                  // animate={{ opacity: 1, y: 0 }}
                  // transition={{ delay: 0.3 }}
                  className="text-base"
                >
                  {t("Venue & Location")}
                </h2>
                <p
                  // initial={{ opacity: 0, y: 20 }}
                  // animate={{ opacity: 1, y: 0 }}
                  // transition={{ delay: 0.4 }}
                  className="text-sm text-secondary-foreground font-light"
                >
                  {venue_address}
                </p>
              </div>
            )}

            {/* Organizer Details */}
            <div className="space-y-2">
              <h2 className="text-base">{t("Organizer")}</h2>
              <div className="flex items-center gap-2 text-sm text-secondary-foreground font-light">
                <Contact className="w-4 h-4" />
                {organizer_name || "To be determined"}
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary-foreground font-light">
                <Phone className="w-4 h-4" />
                {organizer_contact || "To be determined"}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {/* Show variant selection button if product has variants */}
              {/* {variant_options && variant_options.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full h-12 flex items-center justify-between bg-darkgray"
                  onClick={() => setShowVariantDrawer(true)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground">
                      {t("Options")}
                    </span>
                    <span className="text-sm">
                      {getSelectedOptionsDisplay()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )} */}

              {/* Stock Status */}
              {/* {track_quantity && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{t("Stock")}:</span>{" "}
                  {selectedVariant ? (
                    <span
                      className={
                        selectedVariant.quantity > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {selectedVariant.quantity > 0
                        ? t("In Stock")
                        : t("Out of Stock")}
                      ({selectedVariant.quantity} {t("available")})
                    </span>
                  ) : (
                    <span
                      className={
                        quantity > 0 ? "text-green-600" : "text-red-500"
                      }
                    >
                      {quantity > 0 ? t("In Stock") : t("Out of Stock")}(
                      {quantity} {t("available")})
                    </span>
                  )}
                </div>
              )} */}

              {/* <Button 
                className="w-full bg-[rgba(245,245,245,0.5)] text-black hover:bg-[#EBEBEB] border border-[#E5E5E5]"
                onClick={() => handleAddToCart(false)}
              >
                {t("Add to Cart")}
              </Button>
              <Button 
                className="w-full bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90"
                onClick={() => handleAddToCart(true)}
              >
                {t("Buy Now")}
              </Button> */}
            </motion.div>
          </div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            Show variant selection button if product has variants
            {variant_options && variant_options.length > 0 && (
              <Button
                variant="ghost"
                className="w-full h-12 flex items-center justify-between bg-[rgba(245,245,245,0.5)] border border-[#E5E5E5] hover:bg-[#F8F8F8]"
                onClick={() => setShowVariantDrawer(true)}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground">
                    {t("Options")}
                  </span>
                  <span className="text-sm">{getSelectedOptionsDisplay()}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            Stock Status
            {track_quantity && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("Stock")}:</span>{" "}
                {selectedVariant ? (
                  <span
                    className={
                      selectedVariant.quantity > 0
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {selectedVariant.quantity > 0
                      ? t("In Stock")
                      : t("Out of Stock")}
                    ({selectedVariant.quantity} {t("available")})
                  </span>
                ) : (
                  <span
                    className={quantity > 0 ? "text-green-600" : "text-red-500"}
                  >
                    {quantity > 0 ? t("In Stock") : t("Out of Stock")}(
                    {quantity} {t("available")})
                  </span>
                )}
              </div>
            )}
            <Button
              className="w-full bg-[rgba(245,245,245,0.5)] text-black hover:bg-[#EBEBEB] border border-[#E5E5E5]"
              onClick={() => handleAddToCart(false)}
            >
              {t("Add to Cart")}
            </Button>
            <Button
              className="w-full bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90"
              onClick={() => handleAddToCart(true)}
            >
              {t("Buy Now")}
            </Button>
          </motion.div> */}

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-0 left-0 w-full p-6"
          >
            Stock Status
            {(selectedVariant?.track_quantity ?? track_quantity) && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("Stock")}:</span>{" "}
                {selectedVariant ? (
                  <span
                    className={
                      selectedVariant.quantity > 0
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {selectedVariant.quantity > 0
                      ? t("In Stock")
                      : t("Out of Stock")}
                    ({selectedVariant.quantity} {t("available")})
                  </span>
                ) : (
                  <span
                    className={quantity > 0 ? "text-green-600" : "text-red-500"}
                  >
                    {quantity > 0 ? t("In Stock") : t("Out of Stock")}(
                    {quantity} {t("available")})
                  </span>
                )}
              </div>
            )}
          </motion.div> */}
        </div>

        <div className="fixed bottom-0 w-full p-5 pt-4 z-[99] bg-background space-y-4 max-width-mobile">
          {getPriceDisplay() && (
            <div className="flex items-center gap-2">
              <div className="flex items-baseline gap-2">
                <span
                  className="flex flex-col font-bold tracking-tight text-secondary-foreground"
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                >
                  <span className="text-sm font-normal">start from</span>
                  <span className="flex items-center gap-2 text-2xl">
                    {getPriceDisplay()}
                    {/* {selectedVariant?.compare_at_price && (
                      <>
                        <span
                          // initial={{ opacity: 0, x: -10 }}
                          // animate={{ opacity: 0.6, x: 0 }}
                          className="text-sm line-through text-[#999999]"
                        >
                          ฿{selectedVariant.compare_at_price.toLocaleString()}
                        </span>
                        {/* <div
                          // initial={{ opacity: 0, scale: 0.9 }}
                          // animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-mainbutton rounded text-primary-foreground"
                        >
                          {Math.round(
                            (1 -
                              selectedVariant.price /
                                selectedVariant.compare_at_price) *
                              100
                          )}
                          % OFF
                        </div>
                      </>
                    )} */}
                  </span>
                </span>
              </div>
            </div>
          )}
          <Button
            className="w-full main-btn"
            onClick={() => {
              if (
                variant_options &&
                variant_options.length > 0
                // showVariantDrawer
              ) {
                setShowVariantDrawer(true);
              } else {
                handleAddToCart(true);
              }
            }}
          >
            {t("Sign Up")}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You won't be charged yet
          </p>
        </div>
      </div>

      {/* Variant Selection Drawer */}

      {variant_options && variant_options.length > 0 && showVariantDrawer && (
        <VariantDrawer
          open={showVariantDrawer}
          onClose={() => setShowVariantDrawer(false)}
          onSelect={handleVariantSelect}
          variants={product_variants || []}
          variantOptions={variant_options}
          selectedVariantId={selectedVariantId}
          track_quantity={track_quantity}
          onSubmit={handleAddToCart}
        />
      )}
    </div>,
    document.body
  );
}
