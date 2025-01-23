import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";

interface CheckoutFooterProps {
  total: number;
  isProcessing: boolean;
  onPlaceOrder: () => void;
}

export function CheckoutFooter({ total, isProcessing, onPlaceOrder }: CheckoutFooterProps) {
  const t = useTranslate();

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-body text-muted-foreground">{t("Total Payment")}</span>
        <span className="text-title1 font-bold text-[#EE4D2D]">
          ฿{total.toLocaleString()}
        </span>
      </div>
      <Button 
        className="w-full bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 h-12"
        disabled={isProcessing}
        onClick={onPlaceOrder}
      >
        {isProcessing ? t("Processing...") : t("Place Order")}
      </Button>
    </div>
  );
}