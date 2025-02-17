import { useTranslate } from "@refinedev/core";
import { ScanQrCode, CreditCard, Building2, ChevronDown } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    return (
      <div className="bg-darkgray rounded-lg animate-pulse">
        <div className="px-3 py-4">
          <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-darkgray rounded-lg">
        <div className="px-3 py-4">
          <h2 className="text-sm font-medium mb-3">{t("Payment Method")}</h2>

          <div
            className="bg-[rgba(23,23,23,0.05)] rounded-lg p-3 cursor-pointer"
            onClick={() => setShowOptions(true)}
          >
            {selectedOption ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
                    {selectedOption.details?.bank?.image_url ? (
                      <img 
                        src={selectedOption.details.bank.image_url} 
                        alt={selectedOption.details.bank.bank_name}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      selectedOption.icon
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {selectedOption.name}
                    </div>
                    <div className="text-xs text-secondary-foreground">
                      {selectedOption.description}
                    </div>
                    {selectedOption.details?.account_number && (
                      <div className="text-xs text-muted-foreground">
                        {t("Account")}: {selectedOption.details.account_number}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                {t("Select a payment method")}
              </div>
            )}
          </div>
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
                  <div className="w-8 h-8 rounded-lg bg-icon-green-background text-icon-green-foreground flex items-center justify-center overflow-hidden">
                    {option.details?.bank?.image_url ? (
                      <img 
                        src={option.details.bank.image_url} 
                        alt={option.details.bank.bank_name}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      option.icon
                    )}
                  </div>
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
