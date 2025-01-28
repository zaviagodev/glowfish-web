import { motion } from "framer-motion";
import {
  X,
  Users,
  MapPin,
  Calendar,
  Tag,
  Star,
  ChevronRight,
} from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart";
import { VariantDrawer } from "./VariantDrawer";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface ProductVariantOption {
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  price: number;
  quantity: number;
  options: ProductVariantOption[];
  name: Record<string, string>;
  track_quantity: boolean;
}

interface ProductDetailProps {
  id: string | number;
  image: string;
  name: string;
  description?: string;
  location?: string;
  date?: string;
  price?: string | number;
  points?: string | number;
  variant_id?: string;
  quantity?: number;
  track_quantity?: boolean;
  onClose: () => void;
  variant_options?: any[];
  product_variants?: ProductVariant[];
}

export function ProductDetail({
  id,
  image,
  name,
  description,
  location,
  date,
  price,
  points,
  variant_id,
  quantity = 1,
  track_quantity = false,
  onClose,
  variant_options,
  product_variants,
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
      return `฿${selectedVariant.price.toLocaleString()}`;
    }

    if (!product_variants || product_variants.length === 0) {
      return price === 0 ? t("free") : `฿${Number(price).toLocaleString()}`;
    }

    const prices = product_variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `฿${minPrice.toLocaleString()}`;
    }

    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  // Format variant options for display
  const getSelectedOptionsDisplay = () => {
    if (!selectedVariant) {
      return t("Select Options");
    }
    return Object.values(selectedVariant.name);
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
        (acc, opt: ProductVariantOption) => ({
          ...acc,
          [opt.name]: opt.value,
        }),
        {} as Record<string, string>
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

  return createPortal(
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
        onClick={handleBackdropClick}
      />

      <motion.div
        layoutId={`card-${id}`}
        transition={{
          layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
        }}
        className="absolute inset-0 overflow-y-auto bg-background"
      >
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-4 z-[60] bg-black/20 hover:bg-black/30 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <motion.div
          layoutId={`image-container-${id}`}
          className="relative w-full aspect-[4/3] overflow-hidden"
          transition={{
            layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
          }}
        >
          <motion.img
            layoutId={`image-${id}`}
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            transition={{
              layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
            }}
          />
        </motion.div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="space-y-3">
              {getPriceDisplay() && (
                <motion.div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="text-2xl font-bold tracking-tight text-secondary-foreground"
                      style={{
                        willChange: "transform",
                        transform: "translateZ(0)",
                      }}
                    >
                      {getPriceDisplay()}
                    </motion.span>
                    {selectedVariant?.compare_at_price && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 0.6, x: 0 }}
                        className="text-sm line-through text-[#999999]"
                      >
                        ฿{selectedVariant.compare_at_price.toLocaleString()}
                      </motion.span>
                    )}
                  </div>
                  {selectedVariant?.compare_at_price && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-mainbutton rounded"
                    >
                      {Math.round(
                        (1 -
                          selectedVariant.price /
                            selectedVariant.compare_at_price) *
                          100
                      )}
                      % OFF
                    </motion.div>
                  )}
                </motion.div>
              )}
              <motion.h2
                layoutId={`title-${id}`}
                className="text-2xl tracking-tight"
                transition={{
                  layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                }}
              >
                {name}
              </motion.h2>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-[#999999] mb-2.5">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#EE4D2D] text-[#EE4D2D]" />
                      <span>4.8</span>
                    </div>
                    <span>•</span>
                    <span>(128 reviews)</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#999999]" />
                      <span>238 sold</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[#999999]" />
                      <span className="text-[#999999]">{location}</span>
                    </div>
                  )}
                  {date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#999999]" />
                      <span className="text-[#999999]">{date}</span>
                    </div>
                  )}
                  {points && (
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Tag className="w-4 h-4 text-[#999999]" />
                      <span>{t("point", { count: points })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {description && (
              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold tracking-tight"
                >
                  {t("Description")}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-secondary-foreground"
                >
                  {description}
                </motion.p>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {/* Show variant selection button if product has variants */}
              {variant_options && variant_options.length > 0 && (
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
              )}

              {/* Stock Status */}
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
                      className={
                        quantity > 0 ? "text-green-600" : "text-red-500"
                      }
                    >
                      {quantity > 0 ? t("In Stock") : t("Out of Stock")}(
                      {quantity} {t("available")})
                    </span>
                  )}
                </div>
              )}

              <Button
                className="w-full bg-darkgray text-secondary-foreground rounded-full"
                onClick={() => handleAddToCart(false)}
              >
                {t("Add to Cart")}
              </Button>
              <Button
                className="w-full main-btn"
                onClick={() => handleAddToCart(true)}
              >
                {t("Buy Now")}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Variant Selection Drawer */}
      {variant_options && variant_options.length > 0 && showVariantDrawer && (
        <VariantDrawer
          open={showVariantDrawer}
          onClose={() => setShowVariantDrawer(false)}
          onSelect={handleVariantSelect}
          variants={product_variants || []}
          variantOptions={variant_options}
          selectedVariantId={selectedVariantId}
        />
      )}
    </div>,
    document.body
  );
}
