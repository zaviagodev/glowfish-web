import { useTranslate } from "@refinedev/core";
import { Wallet, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  icon: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "promptpay",
    name: "PromptPay",
    description: "Pay via PromptPay QR Code",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/81/PromptPay-logo.png",
  },
  {
    id: "truemoney",
    name: "TrueMoney Wallet",
    description: "Pay with TrueMoney Wallet",
    icon: "https://www.truemoney.com/wp-content/uploads/2022/01/truemoney-wallet-logo.png",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer to our bank account",
    icon: "https://cdn-icons-png.flaticon.com/512/2830/2830289.png",
  },
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    description: "Pay with Visa, Mastercard, etc.",
    icon: "https://cdn-icons-png.flaticon.com/512/179/179457.png",
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    description: "Pay when you receive",
    icon: "https://cdn-icons-png.flaticon.com/512/2489/2489756.png",
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
        <div className="p-4">
          <h2 className="text-sm font-medium mb-3">{t("Payment Method")}</h2>

          <div
            className="bg-[rgba(23,23,23,0.05)] rounded-lg flex items-center justify-between cursor-pointer"
            onClick={() => setShowOptions(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex items-center justify-center overflow-hidden">
                <img
                  src={selectedOption.icon}
                  alt={selectedOption.name}
                  className="w-5 h-5 object-contain"
                />
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
          className="h-[70%] bg-background rounded-t-xl p-4"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-semibold">
              {t("Choose Payment Method")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {paymentOptions.map((option) => (
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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex items-center justify-center overflow-hidden">
                    <img
                      src={option.icon}
                      alt={option.name}
                      className="w-5 h-5 object-contain"
                    />
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
