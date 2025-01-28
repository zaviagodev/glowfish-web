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
    const Icon = action.type === "Received" ? ArrowDownToLine : ArrowUpToLine;
    {
      /* action.type === "earn" */
    }

    return (
      <div
        key={action.id}
        className="flex items-center justify-between py-2 mb-2"
      >
        <div className="flex items-center gap-1.5">
          <div className="border border-[#252525] rounded-full h-9 w-9 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h3 className="page-title">{actionTitle}</h3>
            <p className="text-[#6D6D6D] text-xs">
              {t(action.type)} • {formattedDate}
              {action.description && (
                <span className="ml-1">• {action.description}</span>
              )}
            </p>
          </div>
        </div>

        <p
          className={cn("page-title", {
            "text-[#EE3636]": action.type === "redeem",
          })}
        >
          {action.type === "redeem" ? "-" : ""}
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
        <div className="text-center mt-8">Loading...</div>
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

  return (
    <>
      <Header title={t("History")} />
      <div className="mb-4 px-5">
        <h2 className="text-lg font-semibold">{t("Total Points")}</h2>
        <p className="text-2xl font-bold text-mainorange">
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
              {pointsHistory.map((action) => renderAction(action))}
            </div>
          </TabsContent>

          <TabsContent value="Received">
            <div className="mt-10">
              {earnedPoints.map((action) => renderAction(action))}
            </div>
          </TabsContent>

          <TabsContent value="Used">
            <div className="mt-10">
              {redeemedPoints.map((action) => renderAction(action))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
};

export default HistoryPage;
