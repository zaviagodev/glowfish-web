import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Ticket, Gift, ChevronRight } from "lucide-react";
import { usePoints } from "@/lib/points";
import { useCoupons } from "@/lib/coupon";
import { cn } from "@/lib/utils";

interface PointsCouponsProps {
  onCouponClick?: () => void;
  onPointsClick?: () => void;
  className?: string;
  subtotal: number;
}

export function PointsCoupons({
  onCouponClick,
  onPointsClick,
  className,
  subtotal,
}: PointsCouponsProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const { selectedCoupons, getTotalDiscount } = useCoupons();
  const { selectedPoints, getDiscountAmount } = usePoints();
  const totalDiscount = getTotalDiscount(subtotal);
  const pointsDiscount = getDiscountAmount();

  const selected = selectedCoupons.length > 0 || selectedPoints > 0;

  return (
    <div className={cn("bg-darkgray rounded-lg", className)}>
      <div className="space-y-2">
        <button
          onClick={() => {}}
          className="w-full flex items-center justify-between bg-darkgray rounded-lg p-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center bg-[#E1E1E1]/70 dark:bg-white/10",
                { "bg-icon-orange-background": selected }
              )}
            >
              <Ticket
                className={cn("w-5 h-5 text-black dark:text-white", {
                  "text-icon-orange-foreground": selected,
                })}
              />
            </div>
            <div className="text-sm font-medium">
              {selectedCoupons.length > 0
                ? t("coupons applied", {
                    count: selectedCoupons.length,
                  })
                : t("Coupon")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedCoupons.length > 0 && (
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {selectedCoupons.length}
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-secondary-foreground" />
          </div>
        </button>
      </div>
    </div>
  );
}
