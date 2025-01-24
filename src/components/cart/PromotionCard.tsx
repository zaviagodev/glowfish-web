import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Tag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromotionCardProps {
  className?: string;
}

export function PromotionCard({ className }: PromotionCardProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "bg-tertiary rounded-lg border border-[#E5E5E5] overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => navigate("/promotions")}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex items-center justify-center">
            <Tag className="w-4 h-4 text-[#EE4D2D]" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              {t("All Promotions")}
            </div>
            <div className="text-xs text-secondary-foreground">
              {t("Check out all available promotions")}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-secondary-foreground flex-shrink-0" />
      </button>
    </div>
  );
}
