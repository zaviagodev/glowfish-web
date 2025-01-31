import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Ticket, ChevronRight, Clock, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoucherCardProps {
  voucher: {
    id: string;
    type: "gift" | "coupon";
    title: string;
    description: string;
    expiryDate: string;
    status: "ready" | "used";
    image: string;
    code: string;
  };
}

export function VoucherCard({ voucher }: VoucherCardProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/my-items/${voucher.id}`);
  };

  const statusConfig = {
    ready: {
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)",
      label: t("Ready to Use"),
    },
    used: {
      color: "#8E8E93",
      bgColor: "rgba(142, 142, 147, 0.1)",
      label: t("Used"),
    },
  };

  const typeConfig = {
    gift: {
      icon: Gift,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)",
    },
    coupon: {
      icon: Ticket,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)",
    },
  };

  const config = typeConfig[voucher.type];
  const status = statusConfig[voucher.status];
  const TypeIcon = config.icon;

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "overflow-hidden rounded-lg bg-darkgray flex",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        "backdrop-blur-xl",
        voucher.status === "used" && "opacity-60"
      )}
    >
      <img
        src={voucher.image}
        alt={voucher.title}
        className="w-[120px] object-cover"
      />
      <div className="flex flex-col w-full p-4 justify-between">
        {/* Top Section */}
        <div className="flex items-start gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              {/* Type Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  color: config.color,
                  backgroundColor: config.bgColor,
                }}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                <span>{t(voucher.type === "gift" ? "Gift" : "Coupon")}</span>
              </div>

              {/* Status Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  color: status.color,
                  backgroundColor: status.bgColor,
                }}
              >
                {status.label}
              </div>
            </div>

            {/* Title and Description */}
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight line-clamp-1 mb-1">
              {voucher.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#8E8E93] line-clamp-2">
              {voucher.description}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Expiry */}
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t("Expires")}{" "}
                {new Date(voucher.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* QR Code Button */}
          <button
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "transition-colors duration-200",
              voucher.status === "ready"
                ? "bg-black text-white hover:bg-black/90"
                : "bg-[#8E8E93]/10 text-[#8E8E93]"
            )}
            disabled={voucher.status === "used"}
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
