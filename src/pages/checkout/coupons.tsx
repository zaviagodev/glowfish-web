import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { ChevronLeft, Search, Tag, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoupons, Coupon } from "@/lib/coupon";

// Sample coupons data
const sampleCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME20",
    description: "20% off your first order",
    type: "percentage",
    value: 20,
    minPurchase: 500,
    maxDiscount: 100,
    validUntil: "2024-12-31",
    isApplicable: true,
  },
  {
    id: "2",
    code: "FREESHIP",
    description: "Free shipping on orders over ฿1,000",
    type: "shipping",
    value: 0,
    minPurchase: 1000,
    validUntil: "2024-12-31",
    isApplicable: false,
  },
  {
    id: "3",
    code: "SAVE100",
    description: "฿100 off on orders over ฿1,500",
    type: "fixed",
    value: 100,
    minPurchase: 1500,
    validUntil: "2024-12-31",
    isApplicable: true,
  },
  {
    id: "4",
    code: "FLASH50",
    description: "Flash Sale: 50% off selected items",
    type: "percentage",
    value: 50,
    minPurchase: 2000,
    maxDiscount: 500,
    validUntil: "2024-01-31",
    isApplicable: true,
  },
  {
    id: "5",
    code: "EXPIRED25",
    description: "25% off all items",
    type: "percentage",
    value: 25,
    validUntil: "2023-12-31",
    isApplicable: false,
  },
  {
    id: "6",
    code: "NEWUSER",
    description: "Special offer for new customers: ฿200 off",
    type: "fixed",
    value: 200,
    minPurchase: 1000,
    validUntil: "2024-12-31",
    isApplicable: true,
  },
  {
    id: "7",
    code: "SEASONAL",
    description: "Seasonal discount: 30% off",
    type: "percentage",
    value: 30,
    minPurchase: 1500,
    maxDiscount: 300,
    validUntil: "2024-03-31",
    isApplicable: false,
  },
];

export default function CouponsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedCoupons, addCoupon, removeCoupon } = useCoupons();
  const [coupons, setCoupons] = useState<Coupon[]>(sampleCoupons);

  // Determine if we came from cart or checkout
  const fromCart = location.state?.from === "cart";

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCouponSelect = (coupon: Coupon) => {
    if (coupon.isApplicable) {
      const isSelected = selectedCoupons.some((c) => c.id === coupon.id);
      if (isSelected) {
        removeCoupon(coupon.id);
      } else {
        addCoupon(coupon);
      }
      // Navigate back to the appropriate page
      navigate(fromCart ? "/cart" : "/checkout");
    }
  };

  const formatValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.value}% OFF`;
      case "fixed":
        return `฿${coupon.value} OFF`;
      case "shipping":
        return "FREE SHIPPING";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-transparent -ml-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-title2 font-semibold tracking-tight">
          {t("My Coupons")}
        </h1>
        <div className="w-10" />
      </header>

      <div className="pt-20 px-4 pb-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Input
            className="pl-10 h-12 bg-darkgray border border-input"
            placeholder={t("Search coupons...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-darkgray p-4 rounded-lg ${
                coupon.isApplicable
                  ? selectedCoupons.some((c) => c.id === coupon.id)
                    ? "border-primary ring-2 ring-primary/10 cursor-pointer"
                    : "border-[#E5E5E5] cursor-pointer hover:border-primary/50"
                  : "border-[#E5E5E5] opacity-50"
              } transition-all duration-200`}
              onClick={() => handleCouponSelect(coupon)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-[#EE4D2D]" />
                    <span className="text-lg font-bold text-[#EE4D2D] tracking-tight">
                      {formatValue(coupon)}
                    </span>
                  </div>
                  <h3 className="font-medium mb-1 tracking-tight">
                    {coupon.code}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {coupon.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {t("Valid until")} {coupon.validUntil}
                    </span>
                  </div>
                </div>
                {coupon.isApplicable && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              {coupon.minPurchase && (
                <div className="mt-2 pt-2 border-t border-[#E5E5E5] text-xs text-muted-foreground">
                  {t("Min. spend")}: ฿{coupon.minPurchase.toLocaleString()}
                  {coupon.maxDiscount &&
                    ` • ${t(
                      "Max discount"
                    )}: ฿${coupon.maxDiscount.toLocaleString()}`}
                </div>
              )}
              {!coupon.isApplicable && (
                <div className="mt-2 pt-2 border-t border-[#E5E5E5] text-xs text-destructive">
                  {new Date(coupon.validUntil) < new Date()
                    ? t("Coupon has expired")
                    : t("Not applicable to current order")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
