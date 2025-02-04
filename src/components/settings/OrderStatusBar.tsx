import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Package2, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";

export interface OrderStatus {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  value: string;
}

const defaultOrderStatuses: OrderStatus[] = [
  {
    icon: <Package2 className="w-4 h-4" />,
    label: "Unpaid",
    value: "pending",
    color: "#F44336",
    bgColor: "rgba(244, 67, 54, 0.1)",
  },
  {
    icon: <Clock className="w-4 h-4" />,
    label: "Pending",
    value: "pending",
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
    value: "shipped",
    color: "#2196F3",
    bgColor: "rgba(33, 150, 243, 0.1)",
  },
  {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Delivered",
    value: "delivered",
    color: "#4CAF50",
    bgColor: "rgba(76, 175, 80, 0.1)",
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    label: "Cancelled",
    value: "cancelled",
    color: "#9E9E9E",
    bgColor: "rgba(158, 158, 158, 0.1)",
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
                navigate(`/my-orders?status=${status.value}`)
              }
              className="flex-1 relative flex flex-col items-center gap-1.5 transition-colors rounded-lg p-2 min-w-0"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: status.bgColor }}
              >
                <div style={{ color: status.color }}>{status.icon}</div>
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
