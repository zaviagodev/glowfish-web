import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Coins,
  Gift,
  Sparkles,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePoints } from "@/lib/points";
import { PageHeader } from "@/components/shared/PageHeader";

export default function PointsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const {
    availablePoints,
    selectedPoints,
    exchangeRate,
    minRedeem,
    maxRedeem,
    setSelectedPoints,
    getDiscountAmount,
  } = usePoints();
  const [showAnimation, setShowAnimation] = useState(false);
  const [inputValue, setInputValue] = useState(selectedPoints.toString());
  const [showDecrease, setShowDecrease] = useState(false);
  const [suggestedPoints] = useState([100, 500, 1000, 2000]);

  // Calculate remaining points
  const remainingPoints = availablePoints - (parseInt(inputValue) || 0);

  const handleInputChange = (value: string) => {
    const prevValue = parseInt(inputValue) || 0;
    const cleanValue = value.replace(/^0+/, "");

    if (
      cleanValue === "" ||
      (parseInt(cleanValue) >= 0 && parseInt(cleanValue) <= availablePoints)
    ) {
      setInputValue(cleanValue);
      const newValue = Math.max(
        0,
        Math.min(parseInt(cleanValue) || 0, availablePoints)
      );
      setSelectedPoints(newValue);

      if (newValue > prevValue) {
        setShowAnimation(true);
        setShowDecrease(true);
        setTimeout(() => setShowAnimation(false), 1000);
        setTimeout(() => setShowDecrease(false), 300);
      }
    }
  };

  const handleMaxPoints = () => {
    setInputValue(availablePoints.toString());
    setSelectedPoints(availablePoints);
    setShowAnimation(true);
    setShowDecrease(true);
    setTimeout(() => setShowAnimation(false), 1000);
    setTimeout(() => setShowDecrease(false), 300);
  };

  const handleConfirm = () => {
    navigate("/checkout");
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <PageHeader title={t("Use Points")} />

      <div className="pt-14 pb-20">
        <div className="p-5 space-y-6">
          {/* Points Balance Card */}
          <motion.div className="bg-darkgray rounded-lg">
            <div className="flex items-center gap-3 p-3">
              <motion.div
                className="w-8 h-8 flex items-center justify-center"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Coins className="w-4 h-4 text-primary" />
              </motion.div>
              <h2 className="text-sm font-medium">{t("Available Points")}</h2>
            </div>
            <div className="p-3 pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orangefocus">
                    {availablePoints.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">PTS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded-md bg-primary/5 text-primary text-sm">
                    {t("point", { count: 1 })} = ฿{exchangeRate}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ≈ ฿{(availablePoints * exchangeRate).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {minRedeem > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("Min")}: {minRedeem.toLocaleString()} {t("points")}
                  </p>
                )}
                {maxRedeem && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      {t("Min")}: {maxRedeem.toLocaleString()} {t("points")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Points Input Section */}
          <motion.div className="bg-darkgray rounded-lg p-3 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-tertiary flex items-center justify-center">
                <Gift className="w-4 h-4 text-muted-foreground" />
              </div>
              <h2 className="text-sm font-medium">{t("Redeem Points")}</h2>
            </div>

            <div className="relative mb-6">
              <Input
                type="number"
                pattern="[0-9]*"
                min="0"
                max={availablePoints}
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="font-bold h-12 text-left pr-20 bg-background text-primary rounded-lg"
                placeholder="0"
              />
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-primary h-8"
                onClick={handleMaxPoints}
              >
                {t("MAX")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {suggestedPoints.map((points, index) => (
                <motion.div
                  key={points}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full hover:bg-mainbutton hover:text-black",
                      parseInt(inputValue) === points && "main-btn text-black"
                    )}
                    disabled={points > availablePoints}
                    onClick={() => handleInputChange(points.toString())}
                  >
                    {points.toLocaleString()}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Summary Section */}
          <motion.div>
            {/* <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-tertiary flex items-center justify-center">
                <Receipt className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h2 className="text-sm font-medium">{t("Summary")}</h2>
            </div> */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("Points to spend")}
                </span>
                <span className="font-medium">
                  {selectedPoints.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("Discount amount")}
                </span>
                <span className="font-medium">
                  ฿{getDiscountAmount().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("Remaining points")}
                </span>
                <motion.span
                  className="font-medium"
                  animate={showDecrease ? { scale: [1, 0.95, 1] } : {}}
                >
                  {remainingPoints.toLocaleString()}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t p-5 z-50">
        <Button
          className="w-full main-btn"
          disabled={
            selectedPoints === 0 ||
            selectedPoints < minRedeem ||
            (maxRedeem && selectedPoints > maxRedeem)
          }
          onClick={handleConfirm}
        >
          <span className="mr-2">
            {t("Confirm")} (฿{getDiscountAmount().toLocaleString()})
          </span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Floating coins animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            className="fixed top-1/4 left-1/2 -translate-x-1/2 flex gap-1"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -50, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
            <Coins className="w-6 h-6 text-primary" />
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
