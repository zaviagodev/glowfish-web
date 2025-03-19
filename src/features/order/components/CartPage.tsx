import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Package2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/shared/PageHeader";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useCoupons } from "@/lib/coupon";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { makeTwoDecimals } from "@/lib/utils";

export function CartPage() {
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
  const total = subtotal - discount;

  return (
    <div className="absolute inset-0 bg-background z-50">
      <PageHeader title={`${t("Cart")} (${getTotalItems()})`} />

      <div className="mt-14 overflow-auto h-[calc(100%_-_64px)]">
        <div className="divide-y">
          {items.length > 0 ? (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-3 px-5 flex gap-2.5 items-center"
                >
                  <Checkbox
                    checked={selectedItems.includes(item.variantId)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item.variantId, checked as boolean)
                    }
                  />
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full aspect-square overflow-hidden bg-black">
                        <GlowfishIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium line-clamp-2 mb-1">
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
                          ฿{makeTwoDecimals(item.price).toLocaleString()}
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
                        <span className="w-8 text-center text-sm">
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12 px-4"
            >
              <Package2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                {t("Your cart is empty")}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t max-width-mobile">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
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

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                  {t("Total")}:
                  <span className="text-[#EE4D2D] font-bold text-lg">
                    ฿{makeTwoDecimals(total).toLocaleString()}
                  </span>
                </div>
                {/* <div className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                  {t("Points to use")}:
                  <span className="text-foreground text-lg">
                    {/* TODO: Change to the total points
                    {total.toLocaleString()}
                  </span>
                </div> */}
                {/* {discount < 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {t("Discount")}:
                      <span className="text-[#EE4D2D] font-semibold">
                        -฿{makeTwoDecimals(discount).toLocaleString()}
                      </span>
                    </span>
                  </div>
                )} */}
              </div>
              <Button
                className="main-btn w-[130px]"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  const selectedCartItems = items.filter((item) =>
                    selectedItems.includes(item.variantId)
                  );

                  // Validate prices before proceeding - allow zero prices but prevent negative prices
                  const hasInvalidPrices = selectedCartItems.some(
                    (item) => item.price < 0
                  );
                  if (hasInvalidPrices) {
                    alert(
                      t("Some items have invalid prices. Please try again.")
                    );
                    return;
                  }

                  navigate("/checkout", {
                    state: {
                      selectedItems: selectedCartItems,
                    },
                  });
                }}
              >
                {t("Checkout")} (
                {items
                  .filter((item) => selectedItems.includes(item.variantId))
                  .reduce((total, item) => total + item.quantity, 0)}
                )
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
