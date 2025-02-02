import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PromotionCard } from "@/components/cart/PromotionCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { useNavigate } from "react-router-dom";
import { CouponCard } from "@/components/cart/CouponCard";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useCoupons } from "@/lib/coupon";

export default function CartPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } =
    useCart();
  const { getTotalDiscount } = useCoupons();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items.map((item) => item.variantId) : []);
  };

  const subtotal = items
    .filter((item) => selectedItems.includes(item.variantId))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discount = getTotalDiscount(subtotal);
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal - discount + tax;

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <PageHeader title={`${t("Cart")} (${getTotalItems()})`} />

      {/* Cart Items */}
      <div className="mt-14 overflow-auto h-[calc(100%_-_260px)]">
        <div className="divide-y">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.variantId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-3 flex gap-2.5 items-center"
              >
                <Checkbox
                  checked={selectedItems.includes(item.variantId)}
                  onCheckedChange={(checked) =>
                    handleSelectItem(item.variantId, checked as boolean)
                  }
                />
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">
                    {item.name}
                  </h3>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground mb-1.5 space-x-1">
                      {Object.entries(item.variant).map(
                        ([key, value], index, arr) => (
                          <span key={key}>
                            <span className="text-muted-foreground/70">
                              {key}:
                            </span>{" "}
                            {value}
                            {index < arr.length - 1 && (
                              <span className="mx-1">•</span>
                            )}
                          </span>
                        )
                      )}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#EE4D2D]">
                        ฿{item.price.toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center border rounded overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none hover:bg-muted"
                        onClick={() =>
                          handleQuantityChange(
                            item.variantId,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-xs">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none hover:bg-muted"
                        onClick={() =>
                          handleQuantityChange(
                            item.variantId,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="mx-4 mt-3">
          <PromotionCard />
        </div>
        <CouponCard subtotal={subtotal} className="mx-4 mt-3" />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Select All */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={
                  selectedItems.length === items.length && items.length > 0
                }
                onCheckedChange={(checked) =>
                  handleSelectAll(checked as boolean)
                }
              />
              <span className="text-sm">{t("All")}</span>
            </div>

            {/* Total and Checkout */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium">
                  {t("Total")}:{" "}
                  <span className="text-[#EE4D2D] font-bold">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {discount > 0 && (
                    <>
                      <span>
                        {t("Discount")}:{" "}
                        <span className="text-[#EE4D2D]">
                          -฿{discount.toLocaleString()}
                        </span>
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>
                    {t("Tax")}:{" "}
                    <span className="text-[#EE4D2D]">฿{tax.toFixed(2)}</span>
                  </span>
                </div>
              </div>
              <Button
                className="main-btn w-[100px]"
                disabled={selectedItems.length === 0}
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      selectedItems: items.filter((item) =>
                        selectedItems.includes(item.variantId)
                      ),
                    },
                  })
                }
              >
                {t("Checkout")} ({selectedItems.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
