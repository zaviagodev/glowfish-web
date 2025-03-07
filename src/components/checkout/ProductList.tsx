import { useTranslate } from "@refinedev/core";
import { CartItem } from "@/lib/cart";
import GlowfishIcon from "../icons/GlowfishIcon";
import { makeTwoDecimals } from "@/lib/utils";

interface ProductListProps {
  items: CartItem[];
}

export function ProductList({ items }: ProductListProps) {
  const t = useTranslate();

  return (
    <div className="bg-darkgray rounded-xl shadow-sm border">
      <div className="p-4 pb-0">
        <h2 className="text-sm font-medium mb-3">{t("Products Ordered")}</h2>
        <div className="text-xs text-secondary-foreground">
          {items.length} {t("items")}
        </div>
      </div>

      <div>
        {items.map((item) => (
          <div key={item.variantId} className="p-4 flex gap-3">
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
