import { useTranslate } from "@refinedev/core";
import { ScanQrCode } from "lucide-react";

interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  const t = useTranslate();

  // Always set to promptpay
  if (value !== "promptpay") {
    onChange("promptpay");
  }

  return (
    <div className="bg-darkgray rounded-lg">
      <div className="px-3 py-4">
        <h2 className="text-sm font-medium mb-3">{t("Payment Method")}</h2>

        <div className="bg-[rgba(23,23,23,0.05)] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
              <ScanQrCode className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-secondary-foreground">
                {t("PromptPay")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("Pay via PromptPay QR Code")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
