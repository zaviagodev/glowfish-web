import { useTranslate } from "@refinedev/core"
import { useCustomer } from "@/hooks/useCustomer"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Coins, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { motion } from "framer-motion"
import { useState } from "react"

interface PointTransaction {
  id: string;
  type: "earn" | "redeem";
  points: number;
  description: string;
  created_at: string;
}

interface Customer {
  loyalty_points: number;
  points_transactions: PointTransaction[];
}

const ITEMS_PER_PAGE = 10;

const HistoryPage = () => {
  const t = useTranslate();
  const { customer, loading, error, refreshCustomer } = useCustomer();
  const [currentPage, setCurrentPage] = useState(1);
  const tabClassNames = "font-semibold w-full bg-transparent text-[#6D6D6D] data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D]";

  const handleRefresh = async () => {
    try {
      await refreshCustomer();
    } catch (error) {
      console.error('Error refreshing customer data:', error);
    }
  };

  const renderAction = (action: PointTransaction, index: number) => {
    const actionTitle = action.type === "earn" ? t("Get Point") : t("Spend Point");
    const formattedDate = format(new Date(action.created_at), "MMM dd");

    return (
      <motion.div 
        key={action.id} 
        className="bg-white px-6 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                action.type === "earn" 
                  ? "bg-[#34C759]/10" 
                  : "bg-[#FF3B30]/10"
              )}
            >
              <Coins className={cn(
                "w-5 h-5",
                action.type === "earn" 
                  ? "text-[#34C759]" 
                  : "text-[#FF3B30]"
              )} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {action.description || t(action.type === "earn" ? "Points Earned" : "Points Redeemed")}
              </p>
              <p className="text-xs text-[#8E8E93]">
                {formattedDate}
              </p>
            </div>
          </div>
          <div className={cn(
            "text-sm font-semibold",
            action.type === "earn" 
              ? "text-[#34C759]" 
              : "text-[#FF3B30]"
          )}>
            {action.type === "earn" ? "+" : "-"}{action.points}
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={t("History")} />
        <div className="text-center mt-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={t("History")} />
        <div className="text-center text-red-500 mt-8">{error}</div>
      </div>
    );
  }

  const typedCustomer = customer as unknown as Customer;
  const pointsHistory = typedCustomer?.points_transactions || [];
  const earnedPoints = pointsHistory.filter(p => p.type === "earn");
  const redeemedPoints = pointsHistory.filter(p => p.type === "redeem");

  // Sort all transaction lists by date in descending order
  const sortedHistory = [...pointsHistory].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const sortedEarnedPoints = [...earnedPoints].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const sortedRedeemedPoints = [...redeemedPoints].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Pagination logic
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginateTransactions = (transactions: PointTransaction[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return transactions.slice(startIndex, endIndex);
  };

  const getPageNumbers = (totalPages: number, currentPage: number) => {
    const delta = 2; // Number of pages to show before and after current page
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = paginateTransactions(sortedHistory);
  const paginatedEarnedPoints = paginateTransactions(sortedEarnedPoints);
  const paginatedRedeemedPoints = paginateTransactions(sortedRedeemedPoints);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("History")} />
      
      <div className="pt-14 pb-32">
        {/* Points Overview Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <motion.div 
            className="relative px-6 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {typedCustomer?.loyalty_points || 0}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("Total Points")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="All" onValueChange={() => setCurrentPage(1)}>
            <TabsList className="w-full bg-darkgray border border-input">
              <TabsTrigger value="All" className={tabClassNames}>{t("All")}</TabsTrigger>
              <TabsTrigger value="Received" className={tabClassNames}>{t("Received")}</TabsTrigger>
              <TabsTrigger value="Used" className={tabClassNames}>{t("Spend")}</TabsTrigger>
            </TabsList>
            <TabsContent value="All" className="space-y-px mt-4">
              {paginatedHistory.map((action, index) => renderAction(action, index))}
            </TabsContent>

            <TabsContent value="Received" className="space-y-px mt-4">
              {paginatedEarnedPoints.map((action, index) => renderAction(action, index))}
            </TabsContent>

            <TabsContent value="Used" className="space-y-px mt-4">
              {paginatedRedeemedPoints.map((action, index) => renderAction(action, index))}
            </TabsContent>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {getPageNumbers(totalPages, currentPage).map((page, index) => (
                    typeof page === 'number' ? (
                      <Button
                        key={index}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "w-8 h-8",
                          currentPage === page && "bg-primary text-primary-foreground"
                        )}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-1">
                        {page}
                      </span>
                    )
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default HistoryPage
