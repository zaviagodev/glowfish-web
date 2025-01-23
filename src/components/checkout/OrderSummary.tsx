import { useTranslate } from "@refinedev/core";
import { Receipt } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  shipping: number;
  tax: number;
  total: number;
}

export function OrderSummary({ subtotal, discount, pointsDiscount, shipping, tax, total }: OrderSummaryProps) {
  const t = useTranslate();

  return (
    <div className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5]">
      <div className="flex items-center gap-3 p-3 border-b border-[#E5E5E5]">
        <div className="w-8 h-8 bg-[rgba(245,245,245,0.5)] flex items-center justify-center">
          <Receipt className="w-4 h-4 text-black" />
        </div>
        <h2 className="text-sm font-medium">
          {t("Order Summary")}
        </h2>
      </div>
      <div className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-body text-muted-foreground">{t("Subtotal")}</span>
            <span className="text-body">฿{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-body text-muted-foreground">{t("Discount")}</span>
              <span className="text-body text-black">-฿{discount.toLocaleString()}</span>
            </div>
          )}
          {pointsDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-body text-muted-foreground">{t("Points discount")}</span>
              <span className="text-body text-black">-฿{pointsDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-body text-muted-foreground">{t("Shipping cost")}</span>
            <span className="text-body">฿{shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-body text-muted-foreground">{t("Tax")} (7%)</span>
            <span className="text-body">฿{tax.toFixed(2)}</span>
          </div>
          <div className="pt-3 mt-1 border-t flex justify-between">
            <span className="text-title2 font-semibold">{t("Total")}</span>
            <span className="text-title1 font-bold text-black">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}