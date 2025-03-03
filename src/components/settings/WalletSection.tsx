import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Wallet, Gift, Ticket, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents } from "@/features/home/hooks/useEvents";
import { useCustomer } from "@/hooks/useCustomer";
import { Skeleton } from "../ui/skeleton";

interface WalletItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  count?: number;
  color: string;
  bgColor: string;
  description?: string;
}

interface CustomerEvent {
  event: {
    start_datetime: string;
  };
  tickets: Array<{
    status: string;
  }>;
}

export function WalletSection() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { customer, loading: customerLoading } = useCustomer();

  // Calculate total active tickets count
  const activeTicketsCount = (events as CustomerEvent[] | undefined)?.reduce((total: number, eventData: CustomerEvent) => {
    if (!eventData?.event || !eventData?.tickets) return total;
    const eventDate = new Date(eventData.event.start_datetime);
    // Only count tickets for upcoming events
    if (eventDate > new Date()) {
      const unusedTickets = eventData.tickets.filter(
        (ticket) => ticket.status === "unused"
      ).length;
      return total + unusedTickets;
    }
    return total;
  }, 0) || 0;

  const walletItems: WalletItem[] = [
    {
      icon: <Coins className="w-5 h-5" />,
      label: t("My Points"),
      path: "/points",
      count: customer?.loyalty_points || 0,
      description: t("Available points"),
      color: "#2196F3", // Blue
      bgColor: "rgba(33, 150, 243, 0.1)",
    },
  ];

  return (
    <div className="px-5 py-6 space-y-3">
      {/* Wallet Grid */}
      <h2 className="text-sm font-medium mb-2">{t("My Items")}</h2>
      <div className="bg-darkgray rounded-lg overflow-hidden">
        {walletItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 p-4 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.bgColor }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-sm font-semibold"
                style={{ color: item.color }}
              >
                {item.count?.toLocaleString()}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Standalone Tickets Button */}
      <button
        onClick={() => navigate("/tickets")}
        className="w-full bg-darkgray rounded-lg p-4 transition-colors"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="w-12 h-12 rounded-lg bg-[#E1F5FE1A] flex items-center justify-center">
            <Ticket className="w-5 h-5 text-[#03A9F4]" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">{t("My Tickets")}</div>
            <div className="text-xs text-muted-foreground">
              {t("View all your event tickets")}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#E1F5FE]"></div>
        </div>
      </button>
    </div>
  );
}
