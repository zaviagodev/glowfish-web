import { Package2, Truck, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslate } from "@refinedev/core";

export const statusConfig = {
  unpaid: {
    icon: AlertCircle,
    color: "#F44336", // Red
    bgColor: "rgba(244, 67, 54, 0.1)",
    badge: "bg-red-50 text-red-600"
  },
  pending: {
    icon: Clock,
    color: "#FF9800", // Orange
    bgColor: "rgba(255, 152, 0, 0.1)",
    badge: "bg-orange-50 text-orange-600"
  },
  shipped: {
    icon: Truck,
    color: "#2196F3", // Blue
    bgColor: "rgba(33, 150, 243, 0.1)",
    badge: "bg-blue-50 text-blue-600"
  },
  completed: {
    icon: CheckCircle2,
    color: "#4CAF50", // Green
    bgColor: "rgba(76, 175, 80, 0.1)", 
    badge: "bg-green-50 text-green-600"
  },
  delivered: {
    icon: CheckCircle2,
    color: "#4CAF50", // Green
    bgColor: "rgba(76, 175, 80, 0.1)",
    badge: "bg-green-50 text-green-600"
  },
  cancelled: {
    icon: XCircle,
    color: "#9E9E9E", // Gray
    bgColor: "rgba(158, 158, 158, 0.1)",
    badge: "bg-gray-50 text-gray-600"
  },
  // Add fallback for unknown status
  default: {
    icon: Package2,
    color: "#9E9E9E",
    bgColor: "rgba(158, 158, 158, 0.1)",
    badge: "bg-gray-50 text-gray-600"
  }
};

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = useTranslate();
  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.default;
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
        config.badge
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      <StatusIcon className="w-3.5 h-3.5" />
      <span>{t(status.charAt(0).toUpperCase() + status.slice(1))}</span>
    </div>
  );
}