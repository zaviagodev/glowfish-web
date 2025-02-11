import { useTranslate } from "@refinedev/core";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import { useEffect } from "react";

export default function PaymentSummaryPage() {
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

  const { paymentStatus, paymentMethod, orderNumber, amount, date } =
    location?.state || {
      paymentStatus: "success",
      paymentMethod: "promptpay",
      orderNumber:
        "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: 2500,
      date: new Date().toISOString(),
    };

  const isPending = paymentStatus === "pending";

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="bg-background">
      <PageHeader title={t("Order Summary")} />

      <div className="pt-14 pb-10">
        {/* Status Section */}
        <motion.div
          className="py-8 text-center border-b"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isPending ? (
            <Clock className="w-16 h-16 text-[#F5A623] mx-auto mb-4" />
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <CheckCircle2 className="w-16 h-16 text-[rgb(74,222,128)] mx-auto mb-4" />
            </motion.div>
          )}
          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isPending ? t("Payment Pending") : t("Payment Successful")}
          </motion.h2>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isPending
              ? t("Please complete your payment within 24 hours")
              : t("Your order has been confirmed")}
          </motion.p>
        </motion.div>

        {/* Order Details */}
        <div className="p-6 space-y-6">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-sm font-medium tracking-wide">
              {t("Order Details")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("Order Number")}
                </span>
                <span className="text-sm font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("Payment Method")}
                </span>
                <span className="text-sm font-medium">PromptPay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("Amount")}
                </span>
                <span className="text-sm font-medium">
                  ฿{amount?.toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("Date")}
                </span>
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("Status")}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isPending ? "text-[#F5A623]" : "text-secondary-foreground"
                  }`}
                >
                  {isPending ? t("Pending") : t("Paid")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Instructions for pending payment */}
          {isPending && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-sm font-medium tracking-wide">
                {t("Payment Instructions")}
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li className="text-sm text-muted-foreground">
                  {t("Open your mobile banking app")}
                </li>
                <li className="text-sm text-muted-foreground">
                  {t("Scan the PromptPay QR code")}
                </li>
                <li className="text-sm text-muted-foreground">
                  {t("Verify the amount and complete the payment")}
                </li>
                <li className="text-sm text-muted-foreground">
                  {t("Upload the payment slip")}
                </li>
              </ol>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="p-4 space-y-3">
          <Button
            className="w-full bg-black text-white hover:bg-black/90 h-12"
            onClick={() => navigate("/home")}
          >
            {t("Continue Shopping")}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-[#E5E5E5]"
            onClick={() => navigate("/my-orders")}
          >
            {t("View Orders")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
