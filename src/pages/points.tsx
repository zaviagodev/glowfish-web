import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Coins,
  ChevronRight,
  Gift,
  Info,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react";
import React from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LoadingSpin from "@/components/loading/LoadingSpin";
import { useCustomer } from "@/hooks/useCustomer";
import { usePoints } from "@/features/points/hooks/usePoints";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PointsPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { customer, loading: customerLoading, error: customerError } = useCustomer();
  const {
    points,
    loading: pointsLoading,
    error: pointsError,
    page,
    setPage,
    type,
    setType,
    totalPages,
  } = usePoints();

  // Set isInitialLoad to false after first load
  React.useEffect(() => {
    if (!customerLoading && !pointsLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [customerLoading, pointsLoading]);

  const handleTabChange = (value: string) => {
    setPage(1); // Reset to first page when changing tabs
    setType(value === "all" ? "all" : value === "earn" ? "earn" : "redeem");
  };

  // Only show full page loading on initial load
  if ((customerLoading || pointsLoading) && isInitialLoad) {
    return (
      <div className="bg-background">
        <PageHeader title={t("My Points")} />
        <LoadingSpin />
      </div>
    );
  }

  if (customerError || pointsError) {
    return (
      <div className="bg-background">
        <PageHeader title={t("My Points")} />
        <div className="text-center text-red-500 mt-8">
          {customerError || pointsError}
        </div>
      </div>
    );
  }

  const pointsTransactions = points?.points_transactions || [];
  const availablePoints = points?.loyalty_points || 0;

  const historyTabs = [
    {
      value: "all",
      label: "All",
      data: pointsTransactions,
    },
    {
      value: "earn",
      label: "Received",
      data: pointsTransactions,
    },
    {
      value: "redeem",
      label: "Spend",
      data: pointsTransactions,
    },
  ];

  const renderTransaction = (transaction: any) => {
    const Icon = transaction.type === "earn" ? ArrowUpToLine : ArrowDownToLine;
    const formattedDate = format(new Date(transaction.created_at), "MMM dd");

    return (
      <motion.div
        key={transaction.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                {formattedDate}
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
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const delta = 2; // Number of pages to show before and after current page
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, page - delta);
    const rangeEnd = Math.min(totalPages - 1, page + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6 px-5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((pageNum, index) => (
          <Button
            key={index}
            variant={page === pageNum ? "default" : "outline"}
            className={cn("h-8 w-8", {
              "pointer-events-none": pageNum === "...",
            })}
            onClick={() => typeof pageNum === "number" && setPage(pageNum)}
          >
            {pageNum}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  };

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
              onClick={() => navigate("/points/how-to-get-points")}
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
          <div className="px-5 mb-4">
            <h3 className="text-sm font-medium tracking-wide">
              {t("Points History")}
            </h3>
          </div>
          <section className="px-5">
            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <TabsList className="w-full bg-darkgray border border-input rounded-xl h-9">
                {historyTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="font-semibold w-full rounded-lg h-7 bg-transparent text-[#6D6D6D] data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D]"
                  >
                    {t(tab.label)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {historyTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="mt-4">
                    {!isInitialLoad && pointsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <LoadingSpin />
                      </div>
                    ) : pointsTransactions.length > 0 ? (
                      <>
                        {pointsTransactions.map(renderTransaction)}
                        {renderPagination()}
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        {t("No transactions found")}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
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

    </div>
  );
};

export default PointsPage; 