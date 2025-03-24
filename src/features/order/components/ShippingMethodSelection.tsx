import { useTranslate } from "@refinedev/core";
import { Card } from "@/components/ui/card";
import { ShippingOption, ShippingMethods } from "../services/shippingService";
import LoadingSpin from "@/components/loading/LoadingSpin";
import { ChevronRight, Truck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ShippingMethodSelectionProps {
  methods: ShippingMethods;
  selectedMethod: ShippingOption | null;
  onSelect: (methodId: string) => void;
  loading: boolean;
  error: Error | null;
}

export function ShippingMethodSelection({
  methods,
  selectedMethod,
  onSelect,
  loading,
  error,
}: ShippingMethodSelectionProps) {
  const t = useTranslate();
  const [showOptions, setShowOptions] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {t("Failed to load shipping methods")}
      </div>
    );
  }

  // If fixed rate shipping is enabled, show a simple message
  if (methods.fixed_rate?.enabled) {
    return (
      <Card className="p-3 bg-darkgray flex items-center gap-3 shadow-none border-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-[#AF52DE]/10">
          <Truck className="h-4 w-4 text-[#AF52DE]" />
        </div>
        <div>
          <h3 className="text-sm font-medium">{t("Shipping")}</h3>
          <div className="text-xs text-muted-foreground mt-0.5">
            {t("Fixed rate shipping")}: ฿
            {methods.fixed_rate.amount.toLocaleString()}
          </div>
        </div>
      </Card>
    );
  }

  // If no shipping options available
  if (!methods.options?.length) {
    return null;
  }

  return (
    <>
      <div
        className="bg-darkgray rounded-lg px-3 py-4 cursor-pointer"
        onClick={() => setShowOptions(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-black/10 dark:bg-white/10">
              <Truck className="h-4 w-4 text-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {selectedMethod?.name || t("Shipping Method")}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {selectedMethod
                  ? `฿${selectedMethod.rate.toLocaleString()}`
                  : t("Select a shipping method to calculate shipping cost")}
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent
          side="bottom"
          className="h-[85%] sm:h-[85%] p-0 border-0 outline-none bg-background rounded-t-[14px] max-width-mobile max-w-[500px] mx-auto flex flex-col gap-0"
        >
          <SheetHeader className="px-5 pb-3 pt-8 border-b flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-base font-semibold tracking-tight">
              {t("Choose Shipping Method")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 p-5">
            {methods.options.map((method) => (
              <button
                key={method.id}
                className={cn(
                  "w-full text-left px-3 py-4 rounded-lg transition-all border bg-darkgray",
                  method.id === selectedMethod?.id
                    ? "border-mainbutton"
                    : "border-transparent"
                )}
                onClick={() => {
                  onSelect(method.id);
                  setShowOptions(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-blue-50">
                    <Truck className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{method.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ฿{method.rate.toLocaleString()}
                    </div>
                    {method.is_default && (
                      <div className="text-xs text-primary mt-0.5">
                        {t("Default")}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
