import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Coins,
  ChevronRight,
  TrendingUp,
  Gift,
  Info,
  QrCode,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useCustomer } from "@/hooks/useCustomer";
import { format } from "date-fns";

export default function MyPointsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const { customer, loading, error, refreshCustomer } = useCustomer();

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title={t("My Points")} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <PageHeader title={t("My Points")} />
        <div className="text-center text-red-500 mt-8">{error}</div>
      </div>
    );
  }

  const pointsTransactions = customer?.points_transactions || [];
  const availablePoints = customer?.loyalty_points || 0;
  const nextTierPoints = 2000; // This should come from tiers data when available

  // Sort transactions by date in descending order
  const sortedTransactions = [...pointsTransactions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-background">
      <PageHeader title={t("My Points")} />

      <div className="pt-14 pb-16">
        {/* Points Overview Card */}
        <div className="relative">
          <motion.div
            className="relative px-5 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-darkgray rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {availablePoints.toLocaleString()}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("Available Points")}
                  </p>
                </div>
              </div>

              {/* QR Code Button */}
              {/* <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 h-8 px-3 text-xs border-[#E5E5EA]"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                {t("My QR")}
              </Button> */}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-between bg-darkgray rounded-lg"
              onClick={() => navigate("/settings/how-to-get-points")}
            >
              <div className="flex items-center gap-3">
                <div className="min-w-10 h-10 rounded-lg bg-[#34C759]/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#34C759]" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{t("How to Earn Points")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("Learn ways to earn more points")}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8E8E93] group-hover:text-[#1A1A1A] transition-colors" />
            </Button>
          </motion.div>
        </div>

        {/* Points History */}
        <div className="mt-8">
          <div className="px-5">
            <h3 className="text-sm font-medium tracking-wide">
              {t("Points History")}
            </h3>
          </div>
          <div className="space-y-px">
            {sortedTransactions.slice(0, 5).map((transaction, index) => {
              const Icon =
                transaction.type === "earn" ? ArrowUpToLine : ArrowDownToLine;
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "min-w-10 h-10 rounded-lg flex items-center justify-center",
                          transaction.type === "earn"
                            ? "bg-[#34C759]/10"
                            : "bg-[#FF3B30]/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            transaction.type === "earn"
                              ? "text-[#34C759]"
                              : "text-[#FF3B30]"
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description ||
                            t(
                              transaction.type === "earn"
                                ? "Points Earned"
                                : "Points Redeemed"
                            )}
                        </p>
                        <p className="text-xs text-[#8E8E93]">
                          {format(new Date(transaction.created_at), "MMM dd")}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        transaction.type === "earn"
                          ? "text-[#34C759]"
                          : "text-[#FF3B30]"
                      )}
                    >
                      {transaction.type === "earn" ? "+" : "-"}
                      {transaction.points}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {pointsTransactions.length > 10 && (
            <motion.div
              className="px-5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/history")}
              >
                {t("View All History")}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Info Box */}
        <motion.div
          className="px-5 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#8E8E93]" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {t("About Points")}
              </p>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                {t(
                  "Points are earned through purchases and special promotions. They can be redeemed for discounts and exclusive rewards."
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* QR Code Sheet */}
      <Sheet open={showQR} onOpenChange={setShowQR}>
        <SheetContent
          side="bottom"
          className="h-[70%] p-0 bg-background rounded-t-[14px]"
        >
          <SheetHeader className="px-5 pb-3 pt-6 border-b sticky top-0 bg-background/80 backdrop-blur-xl justify-center h-[50px]">
            <SheetTitle className="text-xs">{t("My Profile QR")}</SheetTitle>
          </SheetHeader>
          <div className="p-6 flex flex-col items-center justify-start h-full">
            <div className="w-64 h-64 rounded-2xl flex items-center justify-center mb-6">
              <QrCode className="w-40 h-40" />
            </div>
            <p className="text-sm text-[#8E8E93] text-center">
              {t("Scan this QR code to view your profile")}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
