import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle, Receipt } from "lucide-react";

interface CheckoutFooterProps {
  total: number;
  isProcessing: boolean;
  onPlaceOrder: () => void;
  storeMessage?: string;
  vatInvoiceData?: {
    enabled: boolean;
    companyName: string;
    taxId: string;
    branch?: string;
    address: string;
  };
  onMessageClick?: () => void;
  onVatClick?: () => void;
}

export function CheckoutFooter({
  total,
  isProcessing,
  onPlaceOrder,
  storeMessage,
  vatInvoiceData,
  onMessageClick,
  onVatClick,
}: CheckoutFooterProps) {
  const t = useTranslate();

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t p-5">
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-body text-muted-foreground">
          {t("Total Payment")}
        </span>
        <span className="text-title1 font-bold text-[#EE4D2D]">
          ฿{total.toLocaleString()}
        </span>
      </div>
      <Button
        className="w-full !bg-mainbutton rounded-full h-12"
        disabled={isProcessing}
        onClick={onPlaceOrder}
      >
        {isProcessing ? t("Processing...") : t("Place Order")}
      </Button>
      {/* <div className="pt-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between text-sm font-normal h-auto rounded-xl px-0"
          onClick={onMessageClick}
        >
          <div className="flex items-center gap-3 w-full justify-center">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium text-muted-foreground">
                {t("Message to Store")}
              </div>
              <div className="text-xs text-secondary-foreground">
                {storeMessage ? storeMessage : t("Any special requests?")}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary-foreground" />
        </Button>

        <Button
          variant="ghost"
          className="w-full flex items-center justify-between text-sm font-normal h-auto rounded-xl px-0"
          onClick={onVatClick}
        >
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium text-muted-foreground">
                {t("Request VAT Invoice")}
              </div>
              <div className="text-xs text-secondary-foreground">
                {vatInvoiceData?.enabled
                  ? `${vatInvoiceData.companyName} (${vatInvoiceData.taxId})`
                  : t("Add your tax information")}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary-foreground" />
        </Button>
      </div> */}
    </div>
  );
}
