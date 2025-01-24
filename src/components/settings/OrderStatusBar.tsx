import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Package2, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";

export interface OrderStatus {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

export function OrderStatusBar() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { orders = [] } = useOrders();

  const orderStatuses: OrderStatus[] = [
    {
      icon: <Package2 className="w-4 h-4" />,
      label: "Unpaid",
      count: orders.filter(order => order.status === "unpaid").length,
      color: "#F44336",
      bgColor: "rgba(244, 67, 54, 0.1)"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Pending",
      count: orders.filter(order => order.status === "pending").length,
      color: "#FF9800",
      bgColor: "rgba(255, 152, 0, 0.1)"
    },
    {
      icon: <Truck className="w-4 h-4" />,
      label: "Shipped",
      count: orders.filter(order => order.status === "shipped").length,
      color: "#2196F3",
      bgColor: "rgba(33, 150, 243, 0.1)"
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Delivered",
      count: orders.filter(order => order.status === "delivered").length,
      color: "#4CAF50",
      bgColor: "rgba(76, 175, 80, 0.1)"
    },
    {
      icon: <XCircle className="w-4 h-4" />,
      label: "Cancelled",
      count: orders.filter(order => order.status === "cancelled").length,
      color: "#9E9E9E",
      bgColor: "rgba(158, 158, 158, 0.1)"
    }
  ];

  const handleSeeAll = () => {
    navigate('/my-orders');
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("My Orders")}
        </h2>
        <button
          onClick={handleSeeAll}
          className="text-sm text-primary hover:text-primary/90 transition-colors"
        >
          {t("See all")}
        </button>
      </div>
      <div className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-3">
          {orderStatuses.map((status) => (
            <button
              key={status.label}
              onClick={() => navigate('/my-orders', { state: { status: status.label.toLowerCase() } })}
              className="flex-1 relative flex flex-col items-center gap-1.5 hover:bg-[#F8F8F8] transition-colors rounded-lg p-2 min-w-0"
            >
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: status.bgColor }}
                >
                  <div style={{ color: status.color }}>
                    {status.icon}
                  </div>
                </div>
                {status.count > 0 && (
                  <div 
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-medium flex items-center justify-center px-1.5"
                    style={{ 
                      backgroundColor: `${status.bgColor}`,
                      color: status.color
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