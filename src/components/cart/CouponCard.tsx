import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Ticket, ChevronRight } from "lucide-react";
import { useCoupons } from "@/lib/coupon";
import { cn } from "@/lib/utils";

interface CouponCardProps {
  subtotal: number;
  className?: string;
}

export function CouponCard({ subtotal, className }: CouponCardProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const { selectedCoupons, getTotalDiscount } = useCoupons();
  const totalDiscount = getTotalDiscount(subtotal);

  return (
    <div className={cn("bg-darkgray rounded-lg", className)}>
      <button
        onClick={() =>
          navigate("/checkout/coupons", { state: { from: "cart" } })
        }
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-icon-blue-background flex items-center justify-center">
            <Ticket className="w-4 h-4 text-icon-blue-foreground" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              {selectedCoupons.length > 0
                ? t("coupons applied", {
                    count: selectedCoupons.length,
                  })
                : t("Select Coupon")}
            </div>
            <div className="text-xs text-secondary-foreground">
              {selectedCoupons.length > 0 ? (
                <span className="text-[#EE4D2D]">
                  -฿{totalDiscount.toLocaleString()}
                </span>
              ) : (
                t("Select a coupon to get discount")
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {selectedCoupons.length > 0 && (
              <div className="px-2 py-1 rounded-full bg-mainbutton/10 text-xs font-medium">
                {selectedCoupons.length}
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-secondary-foreground flex-shrink-0" />
          </div>
        </div>
      </button>
    </div>
  );
}
