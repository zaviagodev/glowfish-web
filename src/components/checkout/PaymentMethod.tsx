import { useTranslate } from "@refinedev/core";
import { ScanQrCode, CreditCard, Building2, ChevronRight } from "lucide-react";
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
import LoadingSpin from "../loading/LoadingSpin";

interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
}

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
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

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  const t = useTranslate();
  const { storeName } = useStore();
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);

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
            description: response.promptpay.name,
            icon: <ScanQrCode className="h-4 w-4" />,
            details: {
              bank: response.promptpay.bank,
              account_name: response.promptpay.name,
            },
          });
        }

        if (response.bank_transfer?.accounts) {
          // Add each bank account as a separate payment option
          response.bank_transfer.accounts.forEach((account) => {
            options.push({
              id: `bank_transfer_${account.id}`,
              name: t("Bank Transfer"),
              description: `${account.bank.bank_name} - ${account.account_name}`,
              icon: <Building2 className="h-4 w-4" />,
              details: {
                bank: account.bank,
                account_name: account.account_name,
                account_number: account.account_number,
              },
            });
          });
        }

        setPaymentOptions(options);

        // Set default payment method if none selected
        if (!value && options.length > 0) {
          onChange(options[0].id);
        }
      } catch (error) {
        console.error("Error fetching payment options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentOptions();
  }, [storeName, t, value, onChange]);

  const selectedOption = paymentOptions.find((option) => option.id === value);

  if (loading) {
    return <LoadingSpin />;
  }

  return (
    <>
      <div
        className="bg-darkgray rounded-lg px-3 py-4"
        onClick={() => setShowOptions(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">{t("Payment Method")}</h2>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              {selectedOption.details?.bank?.image_url ? (
                <img
                  src={selectedOption.details.bank.image_url}
                  alt={selectedOption.details.bank.bank_name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
                  {selectedOption.icon}
                </div>
              )}
            </>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
              <ScanQrCode className="h-4 w-4 text-icon-green-foreground" />
            </div>
          )}

          {selectedOption ? (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {selectedOption.name}
              </div>
              <div className="text-xs text-secondary-foreground">
                {selectedOption.description}
              </div>
              {selectedOption.details?.account_number && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("Account")}: {selectedOption.details?.account_number}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium">
              {t("Select a payment method")}
            </p>
          )}
        </div>
      </div>

      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent
          side="bottom"
          className="h-[85%] sm:h-[85%] p-0 border-0 outline-none bg-background rounded-t-[14px] max-width-mobile max-w-[500px] mx-auto flex flex-col gap-0"
        >
          <SheetHeader className="px-5 pb-3 pt-6 border-b flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-title2 font-semibold tracking-tight">
              {t("Choose Payment Method")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                className={cn(
                  "w-full text-left p-5 rounded-lg transition-all",
                  option.id === value ? "bg-background" : ""
                )}
                onClick={() => {
                  onChange(option.id);
                  setShowOptions(false);
                }}
              >
                <div className="flex items-center gap-3">
                  {option.details?.bank?.image_url ? (
                    <img
                      src={option.details.bank.image_url}
                      alt={option.details.bank.bank_name}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
                      {option.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{option.name}</div>
                    <div className="text-xs text-secondary-foreground">
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
