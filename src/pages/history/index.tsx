import Header from "@/components/main/Header";
import { useCustomer } from "@/hooks/useCustomer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { format } from "date-fns";
import { Button } from "@/components/ui/button"; // Add this import

const HistoryPage = () => {
  const t = useTranslate();
  const { customer, loading, error, refreshCustomer } = useCustomer(); // Add refreshCustomer
  const tabClassNames =
    "font-semibold w-full rounded-lg h-7 bg-transparent text-[#6D6D6D] data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D]";

  // Add refresh handler
  const handleRefresh = async () => {
    try {
      await refreshCustomer();
    } catch (error) {
      console.error("Error refreshing customer data:", error);
    }
  };

  const renderAction = (action: any) => {
    const actionTitle =
      action.type === "earn" ? t("Get Point") : t("Spend Point");
    const formattedDate = format(new Date(action.created_at), "MMM dd");
    const Icon = action.type === "earn" ? ArrowUpToLine : ArrowDownToLine;
    {
      /* action.type === "earn" */
    }

    return (
      <div
        key={action.id}
        className="flex items-center justify-between py-2 mb-2"
      >
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "min-w-10 h-10 rounded-lg flex items-center justify-center text-[#34C759] bg-[#34C759]/10",
              { "text-[#FF3B30] bg-[#FF3B30]/10": action.type === "redeem" }
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div>
            <h3 className={cn("text-sm font-medium")}>{actionTitle}</h3>
            <p className="text-muted-foreground text-sm">
              {t(action.type)} • {formattedDate}
              {action.description && (
                <span className="ml-1">• {action.description}</span>
              )}
            </p>
          </div>
        </div>

        <p
          className={cn("text-sm font-semibold text-[#34C759]", {
            "text-[#EE3636]": action.type === "redeem",
          })}
        >
          {action.type === "redeem" ? "-" : "+"}
          {action.points}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header
          title={t("History")}
          rightButton={
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-white"
              disabled={true}
            >
              {t("Refreshing...")}
            </Button>
          }
        />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title={t("History")}
          rightButton={
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-white"
            >
              {t("Refresh")}
            </Button>
          }
        />
        <div className="text-center text-red-500 mt-8">{error}</div>
      </>
    );
  }

  const pointsHistory = customer?.points_transactions || [];
  const earnedPoints = pointsHistory.filter((p) => p.type === "earn");
  const redeemedPoints = pointsHistory.filter((p) => p.type === "redeem");

  // Pagination logic
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    return pages;
  };

  // const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE);
  // const paginatedHistory = paginateTransactions(sortedHistory);
  // const paginatedEarnedPoints = paginateTransactions(sortedEarnedPoints);
  // const paginatedRedeemedPoints = paginateTransactions(sortedRedeemedPoints);

  return (
    <>
      <Header title={t("History")} />
      <div className="mb-4 px-5">
        <h2 className="text-lg font-semibold">{t("Total Points")}</h2>
        <p className="text-2xl font-bold text-orangefocus">
          {customer?.loyalty_points || 0}
        </p>
      </div>
      <section className="px-6">
        <Tabs defaultValue="All">
          <TabsList className="w-full bg-darkgray border border-input rounded-xl h-9">
            <TabsTrigger value="All" className={tabClassNames}>
              {t("All")}
            </TabsTrigger>
            <TabsTrigger value="Received" className={tabClassNames}>
              {t("Received")}
            </TabsTrigger>
            <TabsTrigger value="Used" className={tabClassNames}>
              {t("Spend")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="All">
            <div className="mt-10">
              {pointsHistory.map((action: any) => renderAction(action))}
            </div>
          </TabsContent>

          <TabsContent value="Received">
            <div className="mt-10">
              {earnedPoints.map((action: any) => renderAction(action))}
            </div>
          </TabsContent>

          <TabsContent value="Used">
            <div className="mt-10">
              {redeemedPoints.map((action: any) => renderAction(action))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
};

export default HistoryPage;
