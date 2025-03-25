import { useTranslate } from "@refinedev/core";
import {
  ScanQrCode,
  Building2,
  ChevronRight,
  WalletCards,
  QrCode,
  Landmark,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Add function to generate full image URL
const getFullImageUrl = (imageUrl: string) => {
  if (!imageUrl) return "";
  const supabaseUrl = import.meta.env.VITE_ADMIN_URL;
  return `${supabaseUrl}/${imageUrl}`;
};

interface PaymentMethodProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
}

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  details?: {
    bank?: {
      bank_code: string;
      bank_name: string;
      bank_name_thai: string;
      image_url: string;
    };
    account_name?: string;
    account_number?: string;
  };
}

interface BankAccount {
  id: string;
  bank: {
    bank_code: string;
    bank_name: string;
    bank_name_thai: string;
    image_url: string;
    swift_code?: string;
  };
  branch: string;
  is_default: string;
  account_name: string;
  account_number: string;
}

interface PaymentOptionsResponse {
  promptpay?: {
    id: string;
    bank: {
      bank_code: string;
      bank_name: string;
      bank_name_thai: string;
      image_url: string;
    };
    name: string;
    qr_code: string;
  };
  bank_transfer?: {
    accounts: BankAccount[];
  };
}

export function PaymentMethod({
  value,
  onChange,
  required = false,
}: PaymentMethodProps) {
  const t = useTranslate();
  const { storeName } = useStore();
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const fetchPaymentOptions = async () => {
      try {
        const { data, error } = await supabase.rpc("get_payment_options", {
          store: storeName,
        });

        if (error) throw error;

        // Transform the data into our PaymentOption format
        const options: PaymentOption[] = [];
        const response = data as PaymentOptionsResponse;

        if (response.promptpay) {
          options.push({
            id: "promptpay",
            name: t("PromptPay"),
            description: t("Pay via PromptPay"),
          });
        }

        if (
          response.bank_transfer &&
          response.bank_transfer.accounts &&
          response.bank_transfer.accounts.length > 0
        ) {
          // Add a single bank transfer option
          options.push({
            id: "bank_transfer",
            name: t("Bank Transfer"),
            description: t("Pay via Bank Transfer"),
          });
        }

        setPaymentOptions(options);
      } catch (error) {
        console.error("Error fetching payment options:", error);
      }
    };

    fetchPaymentOptions();
  }, [storeName, t]);

  const selectedOption = value
    ? paymentOptions.find((option) => option.id === value)
    : null;

  const PaymentMethodIcon = ({ name }: { name: string }) => {
    const checkIfBankTransfer = name === "Bank Transfer";
    const checkIfPromptPay = name === "PromptPay";
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
        style={{
          background: checkIfPromptPay
            ? "#2196F31A"
            : checkIfBankTransfer
            ? "#FF98001A"
            : "#FFFFFF1A",
          color: checkIfPromptPay
            ? "#2196F3"
            : checkIfBankTransfer
            ? "#FF9800"
            : "#FFFFFF",
        }}
      >
        {checkIfPromptPay ? (
          <QrCode className="h-4 w-4" />
        ) : checkIfBankTransfer ? (
          <Landmark className="h-4 w-4" />
        ) : (
          <WalletCards className="h-4 w-4" />
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "bg-darkgray rounded-lg px-3 py-4",
          required && !value ? "border border-destructive" : ""
        )}
        onClick={() => setShowOptions(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">
            {t("Payment Method")}
            {required && <span className="text-destructive ml-1">*</span>}
          </h2>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-3">
          <PaymentMethodIcon name={selectedOption?.name || ""} />
          <div>
            <div className="text-sm font-medium">
              {selectedOption?.name || t("Payment Method")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {selectedOption?.description || t("Select a payment method")}
            </div>
            {selectedOption?.details?.account_number && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {t("Account")}: {selectedOption?.details?.account_number}
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent
          side="bottom"
          className="h-[85%] sm:h-[85%] p-0 border-0 outline-none bg-background rounded-t-[14px] max-width-mobile max-w-[500px] mx-auto flex flex-col gap-0"
        >
          <SheetHeader className="px-5 pb-3 pt-8 border-b flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-base font-semibold tracking-tight">
              {t("Choose Payment Method")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 p-5">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                className={cn(
                  "w-full text-left px-3 py-4 rounded-lg transition-all border bg-darkgray",
                  option.id === value
                    ? "border-mainbutton"
                    : "border-transparent"
                )}
                onClick={() => {
                  onChange(option.id);
                  setShowOptions(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <PaymentMethodIcon name={option.name} />
                  <div>
                    <div className="text-sm font-medium">{option.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                    {option.details?.bank?.bank_name_thai && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {option.details.bank.bank_name_thai}
                      </div>
                    )}
                    {option.details?.account_number && (
                      <div className="text-xs text-muted-foreground">
                        {t("Account")}: {option.details.account_number}
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
