import { useTranslate } from "@refinedev/core";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package2, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowingEdges } from "@/components/ui/glowing-edges";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function ThankYouPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if accessed directly without state
  useEffect(() => {
    if (!location.state) {
      navigate("/home", { replace: true });
    }
  }, [location.state, navigate]);

  // Return null while checking state to prevent flash of content
  if (!location.state) return null;

  const { orderNumber, amount, date } = location.state;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-dvh bg-background relative isolate">
      {/* Glowing Edge Indicator */}
      <GlowingEdges />

      {/* Hero Section */}
      <motion.div
        className="h-[45vh] bg-gradient-to-b from-[#4CAF50]/10 to-background relative overflow-hidden z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div
          className={cn(
            "absolute inset-0 opacity-[0.15]",
            "bg-[radial-gradient(circle_at_1px_1px,#4CAF50_1px,transparent_0)]",
            "bg-[size:24px_24px]",
            "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
          )}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="bg-background rounded-full p-6 mb-6 shadow-lg"
          >
            <CheckCircle2 className="w-16 h-16 text-[#4CAF50]" />
          </motion.div>

          <motion.h1
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t("Thank You for Your Order!")}
          </motion.h1>

          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {t("Your order has been confirmed")}
          </motion.p>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-[60px]"
          >
            <path
              d="M0 0L48 8.875C96 17.75 192 35.5 288 44.375C384 53.25 480 53.25 576 44.375C672 35.5 768 17.75 864 26.625C960 35.5 1056 71 1152 79.875C1248 88.75 1344 71 1392 62.125L1440 53.25V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </motion.div>

      {/* Order Details */}
      <div className="px-5 py-8 space-y-6 relative z-20">
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Order Details")}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("Order Number")}
              </span>
              <span className="text-sm font-medium">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("Amount Paid")}
              </span>
              <span className="text-sm font-medium">
                ฿{amount?.toLocaleString()}.00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("Date")}</span>
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("What's Next?")}
          </h2>
          <div className="space-y-3">
            <div className="bg-darkgray rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
                  <Package2 className="w-5 h-5 text-[#4CAF50]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-1">
                    {t("Order Processing")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("We're preparing your order for shipment")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-darkgray rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#2196F3]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#2196F3]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-1">
                    {t("Estimated Delivery")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Within 3-5 business days")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3 pt-4 relative z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button className="w-full main-btn" onClick={() => navigate("/home")}>
            {t("Continue Shopping")}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 bg-darkgray flex items-center justify-between rounded-lg"
            onClick={() => navigate("/my-orders")}
          >
            <span>{t("Track Order")}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
