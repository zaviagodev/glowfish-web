import { useTranslate } from "@refinedev/core";
import {
  Wallet,
  ChevronRight,
  ScanQrCode,
  CreditCard,
  Banknote,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "promptpay",
    name: "PromptPay",
    description: "Pay via PromptPay QR Code",
    icon: <ScanQrCode className="h-4 w-4" />,
  },
  {
    id: "truemoney",
    name: "TrueMoney Wallet",
    description: "Pay with TrueMoney Wallet",
    icon: <Wallet className="h-4 w-4" />,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer to our bank account",
    icon: <Landmark className="h-4 w-4" />,
  },
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    description: "Pay with Visa, Mastercard, etc.",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    description: "Pay when you receive",
    icon: <Banknote className="h-4 w-4" />,
  },
];

interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  const t = useTranslate();
  const [showOptions, setShowOptions] = useState(false);

  const selectedOption =
    paymentOptions.find((option) => option.id === value) || paymentOptions[0];

  return (
    <>
      <div className="bg-darkgray rounded-lg">
        <div className="px-3 py-4">
          <h2 className="text-sm font-medium mb-3">{t("Payment Method")}</h2>

          <div
            className="bg-[rgba(23,23,23,0.05)] rounded-lg flex items-center justify-between cursor-pointer"
            onClick={() => setShowOptions(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
                {selectedOption.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {selectedOption.name}
                </div>
                <div className="text-xs text-secondary-foreground">
                  {selectedOption.description}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* <button
            onClick={() => setShowOptions(true)}
            className="flex items-center justify-center w-full mt-6 text-xs text-secondary-foreground hover:text-secondary-foreground transition-colors"
          >
            <span className="mr-1">{t("See More")}</span>
            <ChevronRight className="w-3 h-3" />
          </button> */}
        </div>
      </div>

      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent
          side="bottom"
          className="h-[70%] bg-background rounded-t-xl px-5 py-3"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-semibold text-left">
              {t("Choose Payment Method")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all bg-darkgray",
                  option.id === value ? "border border-orangefocus" : ""
                )}
                onClick={() => {
                  onChange(option.id);
                  setShowOptions(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
                    {option.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {option.name}
                    </div>
                    <div className="text-xs text-secondary-foreground">
                      {option.description}
                    </div>
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
