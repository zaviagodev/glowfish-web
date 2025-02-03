import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { Tag, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: {
    type: "percentage" | "fixed" | "shipping";
    value: number;
  };
  minPurchase?: number;
  maxDiscount?: number;
  validUntil: string;
  image: string;
}

// Sample promotions data
const samplePromotions: Promotion[] = [
  {
    id: "1",
    title: "New Year Sale",
    description: "Get 20% off on all items",
    discount: {
      type: "percentage",
      value: 20,
    },
    minPurchase: 500,
    maxDiscount: 1000,
    validUntil: "2024-12-31",
    image: "https://picsum.photos/400/200",
  },
  {
    id: "2",
    title: "Free Shipping",
    description: "Free shipping on orders over ฿1,000",
    discount: {
      type: "shipping",
      value: 0,
    },
    minPurchase: 1000,
    validUntil: "2024-12-31",
    image: "https://picsum.photos/400/200",
  },
  {
    id: "3",
    title: "Flash Sale",
    description: "฿100 off on orders over ฿1,500",
    discount: {
      type: "fixed",
      value: 100,
    },
    minPurchase: 1500,
    validUntil: "2024-12-31",
    image: "https://picsum.photos/400/200",
  },
];

export default function PromotionsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [promotions] = useState<Promotion[]>(samplePromotions);

  const formatDiscount = (discount: Promotion["discount"]) => {
    switch (discount.type) {
      case "percentage":
        return `${discount.value}% OFF`;
      case "fixed":
        return `฿${discount.value} OFF`;
      case "shipping":
        return "FREE SHIPPING";
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <PageHeader title={t("All Promotions")} />

      <div className="pt-14 pb-4">
        {/* Promotions List */}
        <div className="p-5 space-y-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-darkgray rounded-lg overflow-hidden flex"
              onClick={() =>
                navigate("/checkout/coupons", {
                  state: { from: "promotions" },
                })
              }
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="w-[120px] object-cover"
              />
              <div className="p-4">
                <div
                  className={`flex items-center gap-2 mb-2 w-fit px-3 py-1.5 rounded-full bg-mainbutton text-background`}
                >
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {formatDiscount(promo.discount)}
                  </span>
                </div>
                <h3 className="font-medium mb-1">{promo.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {promo.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {/* {t("Valid until")}  */}
                      {promo.validUntil}
                    </span>
                  </div>
                </div>
                {/* {promo.minPurchase && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {t("Min. spend")}: ฿{promo.minPurchase.toLocaleString()}
                    {promo.maxDiscount &&
                      ` • ${t(
                        "Max discount"
                      )}: ฿${promo.maxDiscount.toLocaleString()}`}
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
