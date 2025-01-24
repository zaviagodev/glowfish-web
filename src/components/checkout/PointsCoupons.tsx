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

  return (
    <div
      className={cn(
        "bg-tertiary rounded-lg border border-[#E5E5E5]",
        className
      )}
    >
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate("/checkout/coupons")}
          className="w-full flex items-center justify-between bg-[rgba(23,23,23,0.05)] rounded-lg p-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex items-center justify-center">
              <Ticket className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {selectedCoupons.length > 0
                  ? t("{{count}} Coupons Applied", {
                      count: selectedCoupons.length,
                    })
                  : t("My Coupons")}
              </div>
              <div className="text-xs text-secondary-foreground">
                {selectedCoupons.length > 0 ? (
                  <span className="text-primary">
                    -฿{totalDiscount.toLocaleString()}
                  </span>
                ) : (
                  t("Select a coupon to get discount")
                )}
              </div>
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

        <button
          onClick={() => navigate("/checkout/points")}
          className="w-full flex items-center justify-between bg-[rgba(23,23,23,0.05)] rounded-lg p-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex items-center justify-center">
              <Gift className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t("Use MyPoints")}
                {selectedPoints > 0 && ` (${selectedPoints.toLocaleString()})`}
              </div>
              <div className="text-xs text-secondary-foreground">
                {selectedPoints > 0 ? (
                  <span className="text-primary">
                    -฿${pointsDiscount.toLocaleString()}
                  </span>
                ) : (
                  t("Use your points to get discount")
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary-foreground" />
        </button>
      </div>
    </div>
  );
}
