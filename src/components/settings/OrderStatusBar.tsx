import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Package2, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrderStatus {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

const defaultOrderStatuses: OrderStatus[] = [
  {
    icon: <Clock className="w-4 h-4" />,
    label: "Pending",
    count: 1,
    color: "#FF9800",
    bgColor: "rgba(255, 152, 0, 0.1)",
  },
  {
    icon: <Package2 className="w-4 h-4" />,
    label: "Processing",
    count: 2,
    color: "#2196F3",
    bgColor: "rgba(33, 150, 243, 0.1)",
  },
  {
    icon: <Truck className="w-4 h-4" />,
    label: "Shipped",
    count: 15,
    color: "#af52de",
    bgColor: "rgba(175, 82, 222, 0.1)",
  },
  {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Delivered",
    count: 8,
    color: "#4CAF50", // Green
    bgColor: "rgba(76, 175, 80, 0.1)",
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    label: "Cancelled",
    count: 3,
    color: "#F44336",
    bgColor: "rgba(244, 67, 54, 0.1)",
  },
];

interface OrderStatusBarProps {
  statuses?: OrderStatus[];
}

export function OrderStatusBar({
  statuses = defaultOrderStatuses,
}: OrderStatusBarProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  const handleSeeAll = () => {
    navigate("/my-orders");
  };

  return (
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("My Orders")}
        </h2>
        <button
          onClick={handleSeeAll}
          className="text-sm text-primary hover:text-primary/90 transition-colors no-underline"
        >
          {t("See all")}
        </button>
      </div>
      <div className="bg-darkgray rounded-lg overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-3">
          {statuses.map((status) => (
            <button
              key={status.label}
              onClick={() =>
                navigate("/my-orders", {
                  state: { status: status.label.toLowerCase() },
                })
              }
              className="flex-1 relative flex flex-col items-center gap-1.5 transition-colors rounded-lg p-2 min-w-0"
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: status.bgColor }}
                >
                  <div style={{ color: status.color }}>{status.icon}</div>
                </div>
                {status.count > 0 && (
                  <div
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-medium flex items-center justify-center px-1.5"
                    style={{
                      backgroundColor: `${status.bgColor}`,
                      color: status.color,
                    }}
                  >
                    {status.count}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {t(status.label)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
