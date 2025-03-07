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
  Sparkles,
  Copy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import LoadingSpin from "@/components/loading/LoadingSpin";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

interface Order {
  id: string;
  total: number;
  created_at: string;
  status: string;
}

interface BankTransferDetails {
  selectedAccount?: {
    id: string;
    bank: {
      bank_code: string;
      bank_name: string;
      image_url: string;
    };
    account_name: string;
    account_number: string;
  };
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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [bankTransferDetails, setBankTransferDetails] =
    useState<BankTransferDetails>({});
  const [selectedBankAccount, setSelectedBankAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for component lifecycle
  useEffect(() => {
    console.group("PaymentPage Debug");
    console.log("Component mounted");
    console.log("Order ID:", orderId);
    console.log("Store Name:", storeName);

    return () => {
      console.log("Component unmounted");
      console.groupEnd();
    };
  }, []);

  useEffect(() => {
    const checkSupabaseAndFetchData = async () => {
      console.group("Fetch Order and Payment Options");
      try {
        // Extensive logging
        console.log("Starting fetch process");
        console.log("Supabase client:", !!supabase);

        // Check Supabase client
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }

        // Check authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        console.log("User authentication:", !!user);
        if (authError) {
          console.error("Authentication error:", authError);
        }

        if (authError || !user) {
          console.warn("Redirecting to login due to authentication");
          navigate("/login", { replace: true });
          return;
        }

        // Validate orderId and storeName
        if (!orderId || !storeName) {
          console.warn("Missing orderId or storeName", { orderId, storeName });
          navigate("/cart", { replace: true });
          return;
        }

        console.log("Fetching order with ID:", orderId);
        console.log("Store name:", storeName);

        // Fetch order with more detailed error handling
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        console.log("Order fetch result:", {
          orderData: !!orderData,
          orderError: orderError ? orderError.message : null,
        });

        if (orderError) {
          console.error("Order fetch error details:", orderError);
          setError(orderError.message || "Failed to fetch order");
          navigate("/cart", { replace: true });
          return;
        }
        if (!orderData) {
          console.warn("No order data found");
          navigate("/cart", { replace: true });
          return;
        }

        // Set the full order details
        setOrder(orderData);

        // Extract payment method from order notes
        const orderNotes = JSON.parse(orderData.notes || "{}");
        const storedPaymentMethod = orderNotes.paymentMethod;
        console.log("Stored payment method:", storedPaymentMethod);
        setPaymentMethod(storedPaymentMethod);

        // Fetch payment options
        console.log("Fetching payment options for store:", storeName);
        const { data: paymentData, error: paymentError } = await supabase.rpc(
          "get_payment_options",
          { store: storeName }
        );

        console.log("Payment options fetch result:", {
          paymentData: !!paymentData,
          paymentError: paymentError ? paymentError.message : null,
        });

        if (paymentError) {
          console.error("Payment options fetch error details:", paymentError);
          setError(paymentError.message || "Failed to fetch payment options");
          navigate("/cart", { replace: true });
          return;
        }
        setPaymentOptions(paymentData);

        // If bank transfer, pre-select the first account
        if (
          storedPaymentMethod?.startsWith("bank_transfer") &&
          paymentData.bank_transfer?.accounts
        ) {
          setSelectedBankAccount(paymentData.bank_transfer.accounts[0]);
        }
      } catch (error) {
        console.error("Comprehensive catch block error:", error);

        // More detailed error handling
        if (error instanceof Error) {
          setError(error.message);
          alert(`Error: ${error.message}`);
        }

        navigate("/cart", { replace: true });
      } finally {
        console.log("Fetch process completed");
        console.groupEnd();
        setIsLoading(false);
      }
    };

    checkSupabaseAndFetchData();
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

      // Wait for celebration animation then redirect to thank you page
      setTimeout(() => {
        navigate("/checkout/thank-you", {
          state: {
            orderNumber: order.id,
            amount: order.total,
            date: order.created_at
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

  const handleCopyAccountNum = (id: string) => {
    navigator.clipboard.writeText(id);
    setIsBankNumCopied(true);
    setTimeout(() => setIsBankNumCopied(false), 1500);
  };

  const handleBankAccountSelect = (account: any) => {
    setSelectedBankAccount(account);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // File validation
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert(t("Invalid file type. Please upload JPG, PNG, or PDF."));
        return;
      }

      if (file.size > maxFileSize) {
        alert(t("File is too large. Maximum file size is 5MB."));
        return;
      }

      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append("orderId", orderId!);
      formData.append("storeName", storeName);

      // Determine payment type and method
      const paymentTypeToSend =
        paymentMethod === "promptpay" ? "promptpay" : "bank_transfer";

      formData.append("paymentType", paymentTypeToSend);

      // Handle payment method for bank transfer
      if (paymentMethod?.startsWith("bank_transfer")) {
        if (!selectedBankAccount) {
          alert(t("Please select a bank account first."));
          setIsUploading(false);
          return;
        }
        formData.append("paymentMethod", selectedBankAccount.id);
      } else {
        // For PromptPay, use a default method
        formData.append("paymentMethod", "promptpay");
      }

      // Optional: Add transfer reference (you can enhance this later)
      formData.append("transferReference", "");

      formData.append("slipFile", file);

      // Detailed logging for debugging
      console.group("Payment Slip Upload");
      console.log("Order ID:", orderId);
      console.log("Store Name:", storeName);
      console.log("Payment Type:", paymentTypeToSend);
      console.log(
        "Payment Method:",
        paymentMethod?.startsWith("bank_transfer")
          ? selectedBankAccount?.id
          : "promptpay"
      );
      console.log("File Type:", file.type);
      console.log("File Size:", file.size);
      console.groupEnd();

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
        // More detailed error handling
        const errorMessage =
          result.error || result.details || t("Failed to upload payment slip");

        console.error("Upload Error:", result);
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      // Success handling
      setSlipImage(result.data.slip_url);

      // Optional: Show success toast or message
      alert(t("Payment slip uploaded successfully"));
    } catch (error: any) {
      console.error("Comprehensive upload error:", error);

      // Differentiated error handling
      if (error.message.includes("Missing required fields")) {
        alert(t("Please provide all required information"));
      } else if (error.message.includes("Order not found")) {
        alert(t("Order details are invalid. Please try again."));
      } else if (error.message.includes("Order is not in pending status")) {
        alert(t("This order cannot accept payment at the moment."));
      } else {
        alert(t("An unexpected error occurred during upload"));
      }
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

  const renderBankTransferSelection = () => {
    if (!paymentOptions?.bank_transfer?.accounts) return null;

    return (
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">{t("Select Bank Account")}</h2>
        {paymentOptions.bank_transfer.accounts.map((account: any) => (
          <div
            key={account.id}
            className={cn(
              "flex bg-darkgray items-center p-4 border rounded-lg cursor-pointer gap-2.5",
              selectedBankAccount?.id === account.id ? "border-mainbutton" : ""
            )}
            onClick={() => handleBankAccountSelect(account)}
          >
            <div
              className={cn("bg-white w-4 h-4 rounded-full", {
                "bg-mainbutton border-2 border-black outline outline-1 outline-mainbutton":
                  selectedBankAccount?.id === account.id,
              })}
            />
            <div className="flex-grow">
              <div className="font-medium">{account.bank.bank_name}</div>
              <div className="text-sm text-muted-foreground">
                {t("Account")}:{" "}
                {formatBankAccountNumber(account.account_number)}
              </div>
              <div className="text-xs text-muted-foreground">
                {account.account_name}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const formatBankAccountNumber = (accountNumber: string) => {
    // For 10-digit Bangkok Bank account, use a specific format
    if (accountNumber?.length === 10) {
      return `${accountNumber.slice(0, 3)} ${accountNumber.slice(
        3,
        7
      )} ${accountNumber.slice(7)}`;
    }
    // Fallback to groups of 4 for other account numbers
    const groups = accountNumber?.match(/.{1,4}/g) || [accountNumber];
    return groups.join(" ");
  };

  // If loading, show loading spinner
  if (isLoading) {
    return <LoadingSpin />;
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>{error}</p>
        <Button onClick={() => navigate("/cart")} className="mt-4">
          {t("Back to Cart")}
        </Button>
      </div>
    );
  }

  if (!order || !paymentOptions) {
    return <LoadingSpin />;
  }

  const promptPayInfo = [
    {
      title: t("Account Name"),
      value: paymentOptions?.promptpay?.name || "-",
    },
    {
      title: t("Account Number"),
      value: paymentOptions?.promptpay?.id || "-",
      isCopied: isBankNumCopied,
      onCopy: () => handleCopyAccountNum(paymentOptions?.promptpay?.id),
    },
  ];

  const bankTransferInfo = [
    {
      title: t("Account"),
      value: selectedBankAccount?.account_name || "-",
    },
    {
      title: t("Account Number"),
      value:
        formatBankAccountNumber(selectedBankAccount?.account_number) || "-",
      isCopied: isBankNumCopied,
      onCopy: () => handleCopyAccountNum(selectedBankAccount?.account_number),
    },
    {
      title: t("Branch"),
      value: selectedBankAccount?.branch || "-",
    },
  ];

  return (
    <div className="bg-background">
      <PageHeader
        title={
          paymentMethod === "promptpay"
            ? t("PromptPay QR")
            : paymentMethod?.startsWith("bank_transfer")
            ? t("Bank Transfer")
            : t("Payment")
        }
      />

      <div className="pt-14 pb-[120px]">
        {/* Payment Method Timer and Total */}
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

          {/* Countdown Timer */}
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
              {Math.floor(order.total).toLocaleString()}
            </motion.span>
            <motion.span
              className="text-[25px] font-normal mt-2"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1, color: "rgb(74 222 128)" }}
              transition={{ delay: 0.6 }}
            >
              {Number.isInteger(order.total)
                ? ".00"
                : Math.abs(order.total % 1)
                    .toFixed(2)
                    .slice(1)}
            </motion.span>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-2 my-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-[6px] h-[6px] rounded-full bg-[#34C759] animate-[pulse_1.5s_infinite]" />
            <span className="text-[15px] font-normal text-[#636366]">
              {t("Waiting for payment")}
            </span>
          </motion.div>

          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
          >
            {t("Order")} #{order.id}
          </motion.p>
        </motion.div>

        {/* Conditionally render only the selected payment method */}
        {paymentMethod === "promptpay" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-6 pt-8 text-center"
          >
            <h3 className="text-lg font-semibold mb-4 text-left">Promptpay</h3>
            <div className="space-y-3">
              {/* PromptPay Info */}
              {promptPayInfo.map((info) => (
                <div key={info.title}>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                      {info.title}
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <div className="font-medium">{info.value || "-"}</div>

                      {info.onCopy && info.value && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={info.onCopy}
                          className="relative !bg-transparent h-fit w-fit"
                        >
                          <AnimatePresence>
                            {info.isCopied && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-8 px-2 py-1 bg-green-500 text-white text-xs whitespace-nowrap rounded-full"
                              >
                                {t("Copied!")}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              variant="ghost"
              onClick={handleDownloadQR}
              className="gap-2 relative !bg-transparent"
              disabled={!paymentOptions?.promptpay?.qr_code}
            >
              <Download className="w-4 h-4" />
              {t("Save QR Code")}
            </Button>
          </motion.div>
        )}

        {/* Bank Transfer Section */}
        {paymentMethod?.startsWith("bank_transfer") && (
          <>
            {renderBankTransferSelection()}

            {selectedBankAccount && (
              <div className="p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {selectedBankAccount.bank.bank_name}
                  </h3>
                  <div className="space-y-3">
                    {bankTransferInfo.map((info) => (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">
                          {info.title}
                        </span>
                        <span className="text-sm font-medium flex items-center gap-2">
                          {info.value}
                          {info.onCopy && info.value && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={info.onCopy}
                              className="relative !bg-transparent h-fit w-fit"
                            >
                              <AnimatePresence>
                                {info.isCopied && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-8 px-2 py-1 bg-green-500 text-white text-xs whitespace-nowrap rounded-full"
                                  >
                                    {t("Copied!")}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* File Upload Section */}
        <div className="p-4">
          <div className="bg-darkgray p-5 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {t("Upload Payment Slip")}
            </h3>

            {/* Uploaded Slip Preview */}
            {slipImage ? (
              <div className="mt-4 relative">
                <img
                  src={slipImage}
                  alt="Payment Slip"
                  className="w-full rounded-lg"
                />
                <button
                  onClick={() => setSlipImage(null)}
                  className="absolute top-2 right-2 bg-darkgray/50 text-white p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center border-muted-foreground/25">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="payment-slip-upload"
                  disabled={
                    isUploading ||
                    (!selectedBankAccount &&
                      paymentMethod?.startsWith("bank_transfer"))
                  }
                />
                <label
                  htmlFor="payment-slip-upload"
                  className={cn(
                    "cursor-pointer flex flex-col items-center",
                    (isUploading ||
                      (!selectedBankAccount &&
                        paymentMethod?.startsWith("bank_transfer"))) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {t("Upload Payment Slip")}
                  </p>
                  <p className="text-xs text-secondary-foreground mt-2">
                    {t("JPG, PNG, or PDF (max 5MB)")}
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Payment Button */}
        <div className="fixed bottom-0 bg-background w-full p-5 left-0 flex flex-col items-center max-width-mobile left-[50%] -translate-x-[50%]">
          <Button
            className="main-btn w-full"
            disabled={!slipImage || isConfirming}
            onClick={handleConfirmPayment}
          >
            {isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent mr-2" />
                {t("Confirming")}
              </>
            ) : (
              <>
                {t("Confirm Payment")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-fit text-muted-foreground"
            onClick={handlePayLater}
          >
            <Clock className="w-4 h-4 mr-2" />
            {t("Pay Later")}
          </Button>
        </div>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="rounded-xl p-6 text-center relative overflow-hidden"
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
