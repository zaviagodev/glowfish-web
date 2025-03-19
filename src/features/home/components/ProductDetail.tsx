import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  ChevronLeft,
  ShoppingCart,
  Contact,
  Phone,
  BookImage,
  ChevronRight,
  Map,
} from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart";
import { VariantDrawer } from "./VariantDrawer";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Product, ProductVariant, ProductImage } from "../types/product.types";
import DOMPurify from "dompurify";
import { isPast } from "date-fns";
import { cn, getMapLinks, makeTwoDecimals } from "@/lib/utils";
import ItemCarousel from "@/components/ui/item-carousel";
import LongParagraph from "@/components/ui/long-paragraph";
import ContactUsButton from "@/components/ui/contact-us-button";

interface VariantOption {
  id: string;
  name: string;
  values: string[];
  position: number;
}

interface ProductDetailProps {
  id: string;
  image?: string;
  images?: {
    id: string;
    url: string;
    alt: string;
    position: number;
  }[];
  name?: string;
  description?: string;
  location?: string;
  venue_address?: string;
  date?: string;
  price?: number;
  sales_price?: number;
  points_based_price?: number;
  variant_id?: string;
  quantity?: number;
  track_quantity?: boolean;
  onClose: () => void;
  variant_options?: VariantOption[];
  product_variants?: ProductVariant[];
  organizer_name?: string;
  organizer_contact?: string;
  google_maps_link?: string;
  gallery_link?: string;
  hide_cart?: boolean;
  end_datetime?: string;
  isEvent?: boolean;
}

export function ProductDetail({
  id,
  image,
  images = [],
  name = "",
  description,
  location,
  venue_address,
  date,
  price,
  sales_price,
  points_based_price,
  variant_id,
  quantity = 1,
  track_quantity = false,
  onClose,
  variant_options,
  product_variants,
  organizer_name,
  organizer_contact,
  google_maps_link,
  gallery_link,
  hide_cart,
  end_datetime,
  isEvent,
}: ProductDetailProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);
  const { getTotalItems } = useCart();
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
    if (!product_variants || product_variants.length === 0) {
      return price === 0 ? t("free") : `฿${Number(price).toLocaleString()}`;
    }

    const prices = product_variants.map((v: ProductVariant) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return minPrice === 0
        ? t("free")
        : `฿${makeTwoDecimals(minPrice).toLocaleString()}`;
    }

    return `${
      minPrice === 0
        ? t("free")
        : `฿${makeTwoDecimals(minPrice).toLocaleString()}`
    } - ฿${makeTwoDecimals(maxPrice).toLocaleString()}`;
  };

  const getPointsDisplay = () => {
    if (!product_variants || product_variants.length === 0) {
      return Number(points_based_price).toLocaleString();
    }

    const points = product_variants.map(
      (v: ProductVariant) => v.points_based_price
    );

    if (points) {
      const minPoint = Math.min(...points);
      const maxPoint = Math.max(...points);

      if (minPoint === maxPoint) {
        return `${minPoint.toLocaleString()}`;
      }

      return `${minPoint.toLocaleString()} - ${maxPoint.toLocaleString()}`;
    } else {
      return 0;
    }
  };

  // Get compare at price display
  const getCompareAtPriceDisplay = () => {
    if (!product_variants || product_variants.length === 0) {
      return null;
    }

    const comparePrices = product_variants
      .filter((v) => v.compare_at_price && v.compare_at_price > 0)
      .map((v) => v.compare_at_price!);

    if (comparePrices.length === 0) return null;

    const minComparePrice = Math.min(...comparePrices);
    const maxComparePrice = Math.max(...comparePrices);

    if (minComparePrice === maxComparePrice) {
      return `฿${makeTwoDecimals(minComparePrice).toLocaleString()}`;
    }

    return `฿${makeTwoDecimals(
      minComparePrice
    ).toLocaleString()} - ฿${makeTwoDecimals(
      maxComparePrice
    ).toLocaleString()}`;
  };

  // Format variant options for display
  const getSelectedOptionsDisplay = () => {
    if (!selectedVariant) {
      return t("Select Options");
    }
    return selectedVariant.options
      .map((opt: VariantOption) => opt.values.join(" / "))
      .join(" / ");
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

    if (!id || !name) {
      addToast(t("Invalid product"), "error");
      return;
    }

    addItem({
      variantId: selectedVariantId!,
      productId: id.toString(),
      name,
      image: image || images?.[0]?.url || "/placeholder.png",
      price: selectedVariant?.price || Number(price),
      maxQuantity: shouldTrackQuantity ? stockQuantity : 999999,
      variant: selectedVariant?.options?.reduce(
        (acc: Record<string, string>, opt: any) => ({
          ...acc,
          [opt.name]: Array.isArray(opt.values)
            ? opt.values.join(",")
            : opt.values,
        }),
        {}
      ),
      isEvent: !!date, // Set isEvent to true if the item has a date field
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

  const isEventEnded = end_datetime ? isPast(new Date(end_datetime)) : false;
  const checkIfNoProduct = track_quantity === true && quantity === 0;

  return createPortal(
    <div className="fixed inset-0 z-50 max-width-mobile bg-background pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
        onClick={handleBackdropClick}
      />

      <div className="fixed inset-0 overflow-y-auto bg-background max-width-mobile">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-5 top-5 z-[60] bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white"
          onClick={onClose}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        {!hide_cart && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-5 top-5 z-[60] bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center text-xs">
              {getTotalItems()}
            </span>
          </Button>
        )}
        <ItemCarousel
          images={
            images?.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt || name || "",
              position: img.position,
            })) || []
          }
          image={image || images?.[0]?.url || "/placeholder.png"}
          name={name}
        />

        <div className="p-5 space-y-6 bg-background/70 relative z-[99] backdrop-blur-sm rounded-t-2xl overflow-auto pb-[100px] -top-20">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl">{name}</h2>

              <div className="space-y-2.5">
                {product_variants &&
                  product_variants.some(
                    (variant) =>
                      variant.compare_at_price && variant.compare_at_price > 0
                  ) && (
                    <div className="bg-[#DE473C] text-foreground rounded-full px-1.5 py-0.5 w-fit text-xs">
                      Sale
                    </div>
                  )}
                {isEvent && (
                  <>
                    <div className="flex items-center gap-2 text-sm font-light">
                      <MapPin className="w-4 h-4" />
                      <span>{location || "To be determined"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-light">
                      <Calendar className="w-4 h-4" />
                      <span>{date || "To be determined"}</span>
                    </div>
                  </>
                )}
                {/* {points && (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Tag className="w-4 h-4" />
                    <span>{t("point", { count: points })}</span>
                  </div>
                )} */}
              </div>
            </div>

            {gallery_link && (
              <button
                onClick={() =>
                  window.open(gallery_link, "_blank", "noopener,noreferrer")
                }
                className="flex items-center justify-between p-4 rounded-lg bg-darkgray w-full"
              >
                <div className="flex items-center gap-3">
                  <BookImage className="w-5 h-5 text-foreground" />
                  {t("View gallery")}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            {description && (
              <div className="space-y-2">
                <h2 className="text-base">{t("Description")}</h2>
                <LongParagraph description={description} />
              </div>
            )}

            {venue_address && (
              <div className="space-y-2">
                <h2 className="text-base">{t("Venue & Location")}</h2>
                {/* Get processed map links */}
                {(() => {
                  const { viewLink, embedLink, isShareLink } = getMapLinks(
                    google_maps_link || ""
                  );

                  if (!viewLink) return null;

                  if (isShareLink) {
                    return (
                      <button
                        onClick={() =>
                          window.open(viewLink, "_blank", "noopener,noreferrer")
                        }
                        className="flex items-center justify-between p-4 rounded-lg bg-darkgray w-full"
                      >
                        <div className="flex items-center gap-3">
                          <Map className="w-5 h-5 text-foreground" />
                          {t("View map")}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    );
                  }

                  if (embedLink) {
                    return (
                      <iframe
                        src={embedLink}
                        style={{
                          border: 0,
                          width: "100%",
                          borderRadius: "12px",
                          height: "50vw",
                          maxHeight: "270px",
                        }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    );
                  }
                  return null;
                })()}
                <LongParagraph description={venue_address} />
              </div>
            )}

            {/* Organizer Details */}
            {isEvent && (
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
            )}

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
                className="w-full bg-[#EE4D2D] text-foreground hover:bg-[#EE4D2D]/90"
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
              className="w-full bg-[#EE4D2D] text-foreground hover:bg-[#EE4D2D]/90"
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

        <div className="fixed bottom-0 w-full p-5 pt-4 z-[99] bg-background/80 backdrop-blur-lg max-width-mobile border-t border-t-darkgray">
          {getPriceDisplay() && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-baseline justify-between gap-2 w-full">
                <span
                  className="flex flex-col font-bold tracking-tight text-secondary-foreground"
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                >
                  <span className="text-sm font-normal">
                    {isEvent ? "start from" : "Price"}
                  </span>
                  <span className="flex items-end gap-2 text-2xl">
                    {getPriceDisplay()}

                    {product_variants &&
                      product_variants.some(
                        (variant) =>
                          variant.compare_at_price &&
                          variant.compare_at_price > 0
                      ) && (
                        <span className="text-muted-foreground text-base line-through leading-[26px]">
                          {getCompareAtPriceDisplay()}
                        </span>
                      )}
                  </span>
                </span>
                <span
                  className="flex flex-col font-bold tracking-tight items-end text-secondary-foreground"
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                >
                  <span className="text-sm font-normal">
                    Point{getPointsDisplay() === 1 ? "" : "s"} to use
                  </span>
                  <span className="flex items-end gap-2 text-2xl font-normal">
                    {getPointsDisplay() || 0}
                  </span>
                </span>
              </div>
            </div>
          )}
          <Button
            className="w-full main-btn"
            disabled={isEventEnded || checkIfNoProduct}
            onClick={() => {
              if (variant_options && variant_options.length > 0) {
                setShowVariantDrawer(true);
              } else {
                handleAddToCart(true);
              }
            }}
          >
            {isEventEnded
              ? t("This event has ended")
              : checkIfNoProduct
              ? t("Sold Out")
              : isEvent
              ? t("Sign Up")
              : t("Add to cart")}
          </Button>
          <ContactUsButton />
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
