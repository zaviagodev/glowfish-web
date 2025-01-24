import { useTranslate } from "@refinedev/core";
import { Tag, MessageCircle, Receipt, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/lib/cart";

interface ProductListProps {
  items: CartItem[];
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

export function ProductList({
  items,
  storeMessage,
  vatInvoiceData,
  onMessageClick,
  onVatClick,
}: ProductListProps) {
  const t = useTranslate();

  return (
    <div className="bg-background rounded-xl shadow-sm border border-[#E5E5E5]">
      <div className="p-4">
        <h2 className="text-sm font-medium mb-3">{t("Products Ordered")}</h2>
        <div className="text-xs text-secondary-foreground">
          {items.length} {t("items")}
        </div>
      </div>

      <div>
        {items.map((item) => (
          <div key={item.variantId} className="p-4 flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-muted-foreground line-clamp-2 font-normal">
                {item.name}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  ฿{item.price.toLocaleString()}
                </p>
                <p className="text-xs text-secondary-foreground">
                  x{item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="p-4 space-y-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between text-sm font-normal h-auto p-4 bg-[#F8F8F8] rounded-xl"
            onClick={onMessageClick}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
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
            className="w-full flex items-center justify-between text-sm font-normal h-auto p-4 bg-[#F8F8F8] rounded-xl hover:bg-[#F0F0F0]"
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
        </div>
      </div>
    </div>
  );
}
