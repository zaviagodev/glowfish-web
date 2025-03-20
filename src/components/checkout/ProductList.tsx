import { useTranslate } from "@refinedev/core";
import { CartItem } from "@/lib/cart";
import GlowfishIcon from "../icons/GlowfishIcon";
import { makeTwoDecimals } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ProductListProps {
  items: CartItem[];
}

const LIMITED_ITEMS = 1;

export function ProductList({ items }: ProductListProps) {
  const t = useTranslate();
  const [showAllItems, setShowAllItems] = useState(false);
  const visibleItems = showAllItems ? items : items.slice(0, LIMITED_ITEMS);

  const ChevronIcon = showAllItems ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  );

  return (
    <div className="bg-darkgray rounded-xl shadow-sm border">
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">{t("Products Ordered")}</h2>
          {items.length > LIMITED_ITEMS && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="w-fit flex items-center gap-1 text-sm text-muted-foreground"
            >
              <span>{showAllItems ? "Show less" : "Show more"}</span>
              {ChevronIcon}
            </button>
          )}
        </div>
        <div className="text-xs text-secondary-foreground">
          {items.length} {t("items")}
        </div>
      </div>

      <div>
        {visibleItems.map((item) => (
          <div key={item.variantId} className="p-3 flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
              <h4 className="text-base line-clamp-2 font-normal">
                {item.name}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-semibold">
                  ฿{makeTwoDecimals(item.price).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  x{item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
