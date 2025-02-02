import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Wallet, Gift, Ticket, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useEvents";
import { useCustomer } from "@/hooks/useCustomer";

interface WalletItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  count?: number;
  color: string;
  bgColor: string;
  description?: string;
}

export function WalletSection() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { customer, loading: customerLoading } = useCustomer();

  // Calculate total active tickets count
  const activeTicketsCount = events.reduce((total, eventData) => {
    if (!eventData.event || !eventData.tickets) return total;
    const eventDate = new Date(eventData.event.start_datetime);
    // Only count tickets for upcoming events
    if (eventDate > new Date()) {
      const unusedTickets = eventData.tickets.filter(ticket => ticket.status === 'unused').length;
      return total + unusedTickets;
    }
    return total;
  }, 0);


  const walletItems: WalletItem[] = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: t("My Items"),
      path: "/my-items",
      count: 2500,
      description: t("Active items"),
      color: "#4CAF50", // Green
      bgColor: "rgba(76, 175, 80, 0.1)"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: t("My Coupons"),
      path: "/checkout/coupons",
      count: 3,
      description: t("Active coupons"),
      color: "#FF9800", // Orange
      bgColor: "rgba(255, 152, 0, 0.1)"
    },
    {
      icon: <Coins className="w-5 h-5" />,
      label: t("My Points"),
      path: "/settings/points",
      count: customer?.loyalty_points || 0,
      description: t("Available points"),
      color: "#2196F3", // Blue
      bgColor: "rgba(33, 150, 243, 0.1)"
    }
  ];

  return (
    <div className="px-4 py-6 space-y-3">
      {/* Wallet Grid */}
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        {t("My Items")}
      </h2>
      <div className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] overflow-hidden">
        <div className="divide-y">
          {walletItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#F8F8F8] transition-colors"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: item.bgColor }}
              >
                <div style={{ color: item.color }}>
                  {item.icon}
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-[#1A1A1A]">
                  {item.label}
                </div>
                <div className="text-xs text-[#666666]">
                  {item.description}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: item.color }}>
                  {item.count?.toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Standalone Tickets Button */}
      <button
        onClick={() => navigate('/tickets')}
        className="w-full bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-3 hover:bg-[#F8F8F8] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E1F5FE] flex items-center justify-center">
            <Ticket className="w-5 h-5 text-[#03A9F4]" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-[#1A1A1A]">
              {t("My Tickets")}
            </div>
            <div className="text-xs text-[#666666]">
              {t("View all your event tickets")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-[rgba(3, 169, 244, 0.1)] text-[#03A9F4] text-xs font-medium">
              {activeTicketsCount}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}