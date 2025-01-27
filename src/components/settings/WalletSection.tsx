import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Wallet, Gift, Ticket, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const walletItems: WalletItem[] = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: t("My Items"),
      path: "/my-items",
      count: 2500,
      description: t("Active items"),
      color: "#4CAF50", // Green
      bgColor: "rgba(76, 175, 80, 0.1)",
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: t("My Coupons"),
      path: "/checkout/coupons",
      count: 3,
      description: t("Active coupons"),
      color: "#FF9800", // Orange
      bgColor: "rgba(255, 152, 0, 0.1)",
    },
    {
      icon: <Coins className="w-5 h-5" />,
      label: t("My Points"),
      path: "/settings/points",
      count: 1500,
      description: t("Available points"),
      color: "#2196F3", // Blue
      bgColor: "rgba(33, 150, 243, 0.1)",
    },
  ];

  return (
    <div className="px-4 py-6 space-y-3">
      {/* Wallet Grid */}
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        {t("My Items")}
      </h2>
      <div className="space-y-3">
        {walletItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="bg-darkgray rounded-lg w-full flex items-center gap-3 p-4 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.bgColor }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-muted-foreground">
                {item.label}
              </div>
              <div className="text-xs text-secondary-foreground">
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
        className="bg-darkgray rounded-lg w-full flex items-center gap-3 p-4 transition-colors"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="w-12 h-12 rounded-lg bg-[#E1F5FE] flex items-center justify-center">
            <Ticket className="w-5 h-5 text-[#03A9F4]" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-muted-foreground">
              {t("My Tickets")}
            </div>
            <div className="text-xs text-secondary-foreground">
              {t("View all your event tickets")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full text-[#03A9F4] text-xs font-medium">{/* additional bg: bg-[rgba(3, 169, 244, 0.1)] */}
              2
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
