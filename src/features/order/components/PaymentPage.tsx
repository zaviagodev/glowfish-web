import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { useStore } from "@/hooks/useStore";
import {
  Upload,
  X,
  Download,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Copy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import LoadingSpin from "@/components/loading/LoadingSpin";

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

interface Order {
  id: string;
  total: number;
  created_at: string;
  status: string;
}

export function PaymentPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { storeName } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBankNumCopied, setIsBankNumCopied] = useState(false);

  useEffect(() => {
    const fetchOrderAndPaymentOptions = async () => {
      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        if (!orderData) {
          navigate("/cart", { replace: true });
          return;
        }

        setOrder(orderData);

        // Fetch payment options
        const { data: paymentData, error: paymentError } = await supabase.rpc(
          "get_payment_options",
          { store: storeName }
        );

        if (paymentError) throw paymentError;
        setPaymentOptions(paymentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/cart", { replace: true });
      }
    };

    fetchOrderAndPaymentOptions();
  }, [orderId, navigate, storeName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleConfirmPayment = async () => {
    if (isConfirming || !order) return;

    setIsConfirming(true);
    try {
      // Update order status to paid
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id);

      if (error) throw error;

      setShowCelebration(true);

      // Wait for celebration animation then redirect
      setTimeout(() => {
        navigate("/checkout/thank-you", {
          state: {
            orderNumber: order.id,
            amount: order.total,
            date: order.created_at,
          },
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert(t("Failed to confirm payment. Please try again."));
      setIsConfirming(false);
    }
  };

  const handlePayLater = () => {
    if (!order) return;
    navigate("/checkout/thank-you", {
      state: {
        orderNumber: order.id,
        amount: order.total,
        date: order.created_at,
      },
      replace: true,
    });
  };

  const handleCopyAccountNum = () => {
    navigator.clipboard.writeText(paymentOptions?.promptpay?.id);
    setIsBankNumCopied(true);
    setTimeout(() => setIsBankNumCopied(false), 1500);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append("orderId", orderId!);
      formData.append("storeName", storeName);
      formData.append("paymentType", "promptpay");
      formData.append("slipFile", file);

      // Call the Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-payment-slip`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload payment slip");
      }

      setSlipImage(result.data.slip_url);
    } catch (error: any) {
      console.error("Error uploading slip:", error);
      alert(t(error.message || "Failed to upload payment slip"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!paymentOptions?.promptpay?.qr_code) {
      alert(t("QR code not available"));
      return;
    }
    const link = document.createElement("a");
    link.href = paymentOptions.promptpay.qr_code;
    link.download = "promptpay-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!order || !paymentOptions) {
    return <LoadingSpin />;
  }

  return (
    <div className="bg-background">
      <PageHeader title={t("PromptPay QR")} />

      <div className="pt-14 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-10 text-center border-b relative overflow-hidden"
        >
          {/* Radial glow effect */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[200%] aspect-[2/1]">
            <div
              className={cn(
                "absolute inset-0",
                "bg-[radial-gradient(50%_100%_at_50%_100%,rgba(52,211,153,0.15)_0%,rgba(52,211,153,0.05)_30%,transparent_100%)]",
                "animate-pulse"
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                "bg-[radial-gradient(50%_100%_at_50%_100%,rgba(52,211,153,0.1)_0%,rgba(52,211,153,0.02)_40%,transparent_100%)]",
                "animate-[pulse_2s_infinite]"
              )}
            />
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-orange-50 text-orange-500 text-sm font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Clock className="w-4 h-4" />
            {formatTime(countdown)}
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold">
              ฿{order.total.toLocaleString()}
            </h2>
            <p className="text-muted-foreground">
              {t("Order")} #{order.id}
            </p>
          </div>

          {/* QR Code */}
          <div className="mt-8 mb-6 relative mx-auto w-64 h-64 bg-white p-4 rounded-xl shadow-lg">
            {paymentOptions?.promptpay?.qr_code ? (
              <img
                src={paymentOptions.promptpay.qr_code}
                alt="PromptPay QR"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  {t("QR code not available")}
                </p>
              </div>
            )}
          </div>

          {/* Download QR Button */}
          <Button
            variant="outline"
            onClick={handleDownloadQR}
            className="gap-2"
            disabled={!paymentOptions?.promptpay?.qr_code}
          >
            <Download className="w-4 h-4" />
            {t("Save QR Code")}
          </Button>

          {/* PromptPay Number */}
          <div className="mt-6 px-6">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="text-muted-foreground">PromptPay ID</div>
                <div className="font-medium">
                  {paymentOptions?.promptpay?.id || "-"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAccountNum}
                className="relative"
              >
                <AnimatePresence>
                  {isBankNumCopied && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-green-500 text-white text-xs whitespace-nowrap"
                    >
                      {t("Copied!")}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Upload Slip */}
        <div className="px-6 py-8">
          <h3 className="text-lg font-semibold mb-4">
            {t("Upload Payment Slip")}
          </h3>

          {slipImage ? (
            <div className="relative rounded-lg overflow-hidden mb-6">
              <img
                src={slipImage}
                alt="Payment slip"
                className="w-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSlipImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="block">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <div
                  className={cn(
                    "h-32 rounded-lg border-2 border-dashed border-muted-foreground/25",
                    "flex flex-col items-center justify-center gap-2",
                    "cursor-pointer hover:border-primary/50 transition-colors",
                    shimmer
                  )}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        {t("Click to upload slip")}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </label>
          )}

          <div className="space-y-3">
            <Button
              className="main-btn w-full relative"
              disabled={!slipImage || isConfirming}
              onClick={handleConfirmPayment}
            >
              {isConfirming ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {t("Confirm Payment")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handlePayLater}
            >
              {t("Pay Later")}
            </Button>
          </div>
        </div>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="bg-white rounded-xl p-6 text-center relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center">
                <Sparkles className="w-12 h-12 text-green-500 mb-2" />
                <h3 className="text-xl font-bold mb-1">
                  {t("Payment Confirmed!")}
                </h3>
                <p className="text-muted-foreground">
                  {t("Redirecting to order summary...")}
                </p>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.1),transparent_70%)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 