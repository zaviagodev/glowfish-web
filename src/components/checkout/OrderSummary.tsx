import { makeTwoDecimals } from "@/lib/utils";
import { useTranslate } from "@refinedev/core";
import { Receipt } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  shipping: number;
  total: number;
}

export function OrderSummary({
  subtotal,
  discount,
  pointsDiscount,
  shipping,
  total,
}: OrderSummaryProps) {
  const t = useTranslate();

  return (
    <div>
      {/* <div className="flex items-center gap-3 border-b border-[#E5E5E5]">
        <div className="w-8 h-8 bg-tertiary flex items-center justify-center">
          <Receipt className="w-4 h-4 text-secondary-foreground" />
        </div>
        <h2 className="text-sm font-medium">{t("Order Summary")}</h2>
      </div> */}
      <div>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-body text-muted-foreground">
              {t("Subtotal")}
            </span>
            <span className="text-body">
              ฿{makeTwoDecimals(subtotal).toLocaleString()}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-body text-muted-foreground">
                {t("Discount")}
              </span>
              <span className="text-body text-secondary-foreground">
                -฿{makeTwoDecimals(discount).toLocaleString()}
              </span>
            </div>
          )}
          {pointsDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-body text-muted-foreground">
                {t("Points discount")}
              </span>
              <span className="text-body text-secondary-foreground">
                -฿{pointsDiscount.toLocaleString()}
              </span>
            </div>
          )}
          {shipping > 0 && (
            <div className="flex justify-between">
              <span className="text-body text-muted-foreground">
                {t("Shipping cost")}
              </span>
              <span className="text-body">฿{makeTwoDecimals(shipping).toLocaleString()}</span>
            </div>
          )}
          <div className="pt-3 mt-1 border-t flex justify-between">
            <span className="font-semibold">{t("Total")}</span>
            <span className="font-bold text-secondary-foreground">
              ฿{makeTwoDecimals(total).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
