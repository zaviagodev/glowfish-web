import { useTranslate } from "@refinedev/core";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  courier: string;
}

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    price: 40,
    estimatedDays: "3-5",
    courier: "Standard Shipping",
  },
  {
    id: "express",
    name: "Express Delivery",
    price: 100,
    estimatedDays: "1-2",
    courier: "Express Shipping",
  },
  {
    id: "same-day",
    name: "Same Day Delivery",
    price: 200,
    estimatedDays: "Today",
    courier: "Premium Shipping",
  },
];

interface ShippingMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function ShippingMethod({ value, onChange }: ShippingMethodProps) {
  const t = useTranslate();
  const [showOptions, setShowOptions] = useState(false);

  const selectedOption =
    shippingOptions.find((option) => option.id === value) || shippingOptions[0];

  return (
    <>
      <div className="bg-tertiary rounded-lg border border-[#E5E5E5]">
        <div className="p-4">
          <h2 className="text-sm font-medium mb-3">{t("Shipping Method")}</h2>

          <div
            className="bg-[rgba(23,23,23,0.05)] rounded-lg p-3 cursor-pointer"
            onClick={() => setShowOptions(true)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-medium">{selectedOption.name}</h3>
              <span className="text-sm font-semibold">
                ฿{selectedOption.price}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-secondary-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {selectedOption.estimatedDays} {t("days")}
                </span>
              </div>
              <span>•</span>
              <span>{selectedOption.courier}</span>
            </div>
          </div>
          <button
            onClick={() => setShowOptions(true)}
            className="flex items-center justify-center w-full mt-6 text-xs text-secondary-foreground hover:text-secondary-foreground transition-colors"
          >
            <span className="mr-1">{t("See More")}</span>
            <span className="text-sm leading-none translate-y-[1px]">›</span>
          </button>
        </div>
      </div>

      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent
          side="bottom"
          className="h-[70%] bg-background rounded-t-xl p-4"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-semibold">
              {t("Choose Shipping Method")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <button
                key={option.id}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all",
                  option.id === value
                    ? "bg-[rgba(23,23,23,0.05)] border border-[#E0E0E0]"
                    : "bg-tertiary hover:bg-[#F2F2F2]"
                )}
                onClick={() => {
                  onChange(option.id);
                  setShowOptions(false);
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium">{option.name}</span>
                  <span className="font-semibold">฿{option.price}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {option.estimatedDays} {t("days")}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{option.courier}</span>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
