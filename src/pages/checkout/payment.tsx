import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import {
  Upload,
  X,
  Download,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock QR code image URL - replace with actual QR code generation
const mockQRCode =
  "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`;

export default function PaymentPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [isConfirming, setIsConfirming] = useState(false);

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

  const handleConfirmPayment = () => {
    if (isConfirming) return;

    setIsConfirming(true);
    setShowCelebration(true);

    // Wait for celebration animation then redirect
    setTimeout(() => {
      navigate("/checkout/thank-you", {
        state: {
          orderNumber:
            "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          amount: 2500,
          date: new Date().toISOString(),
        },
        replace: true,
      });
    }, 1500);
  };

  const handlePayLater = () => {
    navigate("/checkout/thank-you", {
      state: {
        orderNumber:
          "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: 2500,
        date: new Date().toISOString(),
      },
      replace: true,
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSlipImage(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading slip:", error);
      alert(t("Failed to upload payment slip"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = mockQRCode;
    link.download = "promptpay-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("PromptPay QR")} />

      <div className="pt-14 pb-10">
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

          <motion.p
            className="text-base font-normal text-[#636366] mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t("Amount to Pay")}
          </motion.p>

          <motion.div
            className="relative inline-flex items-start gap-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <motion.span
              className="text-[25px] font-normal mt-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1, color: "rgb(74 222 128)" }}
              transition={{ delay: 0.6 }}
            >
              ฿
            </motion.span>
            <motion.span
              className="text-[58px] leading-none font-semibold tracking-tight"
              initial={{ color: "#1C1C1E" }}
              animate={{ color: "rgb(74 222 128)" }}
              transition={{
                delay: 0.7,
                duration: 0.8,
                ease: "easeOut",
              }}
              style={{
                fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
                fontFeatureSettings: "'tnum' on, 'lnum' on",
              }}
            >
              2,500
            </motion.span>
            <motion.span
              className="text-[25px] font-normal mt-2"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1, color: "rgb(74 222 128)" }}
              transition={{ delay: 0.6 }}
            >
              .00
            </motion.span>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-2 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-[6px] h-[6px] rounded-full bg-[#34C759] animate-[pulse_1.5s_infinite]" />
            <span className="text-[15px] font-normal text-[#636366]">
              {t("Waiting for payment")}
            </span>
          </motion.div>
        </motion.div>

        {/* QR Code */}
        <motion.div
          className="p-6 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className={cn(
              "w-64 h-64 bg-background rounded-2xl shadow-lg p-4 mb-4",
              shimmer
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.8,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <img
              src={mockQRCode}
              alt="PromptPay QR Code"
              className="w-full h-full object-contain"
            />
          </motion.div>
          <motion.p
            className="text-sm text-center text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {t("Scan with any mobile banking app")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full border-[#E5E5E5] hover:bg-[#F5F5F5]"
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4 mr-2" />
              {t("Save QR Code")}
            </Button>
          </motion.div>
        </motion.div>

        {/* Upload Section */}
        <div className="px-4">
          <motion.div
            className="bg-darkgray rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-medium">
                  {t("Payment Confirmation")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Upload your payment slip to confirm")}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {slipImage ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative rounded-xl overflow-hidden bg-background"
                >
                  <img
                    src={slipImage}
                    alt="Payment slip"
                    className="w-full h-48 object-cover"
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 bg-black/20 hover:bg-black/30 text-white rounded-full shadow-lg"
                      onClick={() => setSlipImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="slip-upload"
                  />
                  <label
                    htmlFor="slip-upload"
                    className={cn(
                      "flex flex-col items-center justify-center h-48",
                      "border-2 border-dashed border-[#E5E5E5] rounded-xl",
                      "cursor-pointer transition-all duration-200",
                      "hover:border-primary/20 hover:bg-primary/5",
                      "group relative overflow-hidden"
                    )}
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full mb-3",
                          "bg-primary/5 flex items-center justify-center",
                          "group-hover:scale-110 transition-transform duration-200"
                        )}
                      >
                        <Upload
                          className={cn(
                            "w-6 h-6 text-primary/60",
                            "group-hover:text-primary transition-colors duration-200"
                          )}
                        />
                      </div>
                      <p className="text-base font-medium mb-1">
                        {isUploading
                          ? t("Uploading...")
                          : t("Upload Payment Slip")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("JPG, PNG or PDF up to 10MB")}
                      </p>
                    </div>

                    {/* Animated background gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 -z-10",
                        "bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.05)_0,transparent_100%)]",
                        "group-hover:bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.1)_0,transparent_100%)]",
                        "transition-all duration-500"
                      )}
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Helper text */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t(
                  "Make sure your slip is clear and shows the full payment details"
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="p-4 space-y-3">
          <Button
            className="w-full bg-black text-white hover:bg-black/90 h-12"
            disabled={isConfirming}
            onClick={handleConfirmPayment}
          >
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {t("Processing...")}
                </motion.span>
              </span>
            ) : (
              t("Confirm Payment")
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-12 text-muted-foreground hover:text-foreground"
            onClick={handlePayLater}
            disabled={isConfirming}
          >
            <Clock className="w-4 h-4 mr-2" />
            {t("Pay Later")}
          </Button>
        </div>
      </motion.div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <motion.div
                className="bg-background rounded-full p-8 mb-4 shadow-xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 className="w-16 h-16 text-[rgb(74,222,128)]" />
              </motion.div>

              <motion.h2
                className="text-xl font-semibold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t("Payment Successful!")}
              </motion.h2>

              <motion.p
                className="text-white/80 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {t("Redirecting to order summary...")}
              </motion.p>

              <motion.div
                className="absolute -top-6 -left-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-purple-300" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
