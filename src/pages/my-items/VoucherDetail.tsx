import { useTranslate } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import {
  Gift,
  Clock,
  QrCode,
  Barcode,
  Copy,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GlowingEdges } from "@/components/ui/glowing-edges";

// Mock data - replace with actual data fetching
const mockVoucher = {
  id: "1",
  type: "gift",
  title: "50% Off Any Coffee",
  description:
    "Get 50% off on any coffee drink at any Glowfish location. Valid for one-time use only.",
  expiryDate: "2024-02-28",
  status: "ready",
  image: "https://picsum.photos/200/300",
  code: "COFFEE50",
  terms: [
    "Valid for one-time use only",
    "Cannot be combined with other promotions",
    "Valid at participating locations only",
    "Not valid on holidays",
    "No cash value",
    "Must present code at time of purchase",
    "Management reserves the right to modify or cancel promotion at any time",
  ],
};

export default function VoucherDetail() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("qr");
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // In a real app, fetch voucher data based on id
  const voucher = mockVoucher;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("Voucher Details")} />
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-50"
          style={{
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.8) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="pt-14 pb-32">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-white to-[#F8F8F8] pb-6">
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Image */}
            <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden mb-6 shadow-lg">
              <img
                src={voucher.image}
                alt={voucher.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Type Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF9500]/10 text-[#FF9500] text-xs font-medium mb-3">
              <Gift className="w-3.5 h-3.5" />
              <span>{t(voucher.type === "gift" ? "Gift" : "Coupon")}</span>
            </div>

            {/* Title and Description */}
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              {voucher.title}
            </h1>
            <p className="text-base text-[#8E8E93] leading-relaxed">
              {voucher.description}
            </p>

            {/* Expiry */}
            <div className="mt-4 flex items-center gap-1.5 text-sm text-[#8E8E93]">
              <Clock className="w-4 h-4" />
              <span>
                {t("Valid until")}{" "}
                {new Date(voucher.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Code Section */}
        <div className="px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-sm"
          >
            {/* Tabs */}
            <div className="flex border-b border-[#E5E5EA]">
              {[
                { id: "qr", icon: QrCode, label: "QR Code" },
                { id: "barcode", icon: Barcode, label: "Barcode" },
                { id: "code", icon: Copy, label: "Code" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center gap-2",
                    "text-sm font-medium transition-colors relative",
                    activeTab === tab.id
                      ? "text-[#007AFF]"
                      : "text-[#8E8E93] hover:text-[#8E8E93]/80"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {t(tab.label)}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]"
                      layoutId="activeTab"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "qr" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-48 h-48 bg-[#F8F8F8] rounded-2xl flex items-center justify-center mb-4">
                    <QrCode className="w-32 h-32 text-secondary-foreground" />
                  </div>
                  <p className="text-sm text-[#8E8E93]">
                    {t("Scan to redeem")}
                  </p>
                </motion.div>
              )}

              {activeTab === "barcode" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-full h-32 bg-[#F8F8F8] rounded-2xl flex items-center justify-center mb-4">
                    <Barcode className="w-48 h-24 text-secondary-foreground" />
                  </div>
                  <p className="text-sm text-[#8E8E93]">
                    {t("Show barcode to staff")}
                  </p>
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="bg-[#F8F8F8] rounded-xl p-4 flex items-center justify-between">
                    <div className="font-mono text-lg font-medium">
                      {voucher.code}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:bg-black/5"
                      onClick={handleCopyCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-center text-[#8E8E93]">
                    {t("Show code to staff")}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Terms & Conditions */}
        <motion.div
          className="px-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-background rounded-2xl border border-[#E5E5EA] overflow-hidden">
            <div className="p-4 border-b border-[#E5E5EA] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#8E8E93]" />
              <h2 className="text-base font-medium">
                {t("Terms & Conditions")}
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {voucher.terms.map((term, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-2 flex-shrink-0" />
                    <p className="text-sm text-[#8E8E93] leading-relaxed">
                      {term}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copied Toast */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm shadow-lg"
          >
            {t("Code copied to clipboard")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
