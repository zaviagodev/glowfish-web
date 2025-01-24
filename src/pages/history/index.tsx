import { useTranslate } from "@refinedev/core"
import { useCustomer } from "@/hooks/useCustomer"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Coins } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { motion } from "framer-motion"

const HistoryPage = () => {
  const t = useTranslate();
  const { customer, loading, error, refreshCustomer } = useCustomer();
  const tabClassNames = "font-semibold w-full bg-transparent text-[#6D6D6D] data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D]";

  const handleRefresh = async () => {
    try {
      await refreshCustomer();
    } catch (error) {
      console.error('Error refreshing customer data:', error);
    }
  };

  const renderAction = (action: any, index: number) => {
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

  const pointsHistory = customer?.points_transactions || [];
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
                    {customer?.loyalty_points || 0}
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
          <Tabs defaultValue="All">
            <TabsList className="w-full bg-darkgray border border-input">
              <TabsTrigger value="All" className={tabClassNames}>{t("All")}</TabsTrigger>
              <TabsTrigger value="Received" className={tabClassNames}>{t("Received")}</TabsTrigger>
              <TabsTrigger value="Used" className={tabClassNames}>{t("Spend")}</TabsTrigger>
            </TabsList>
            <TabsContent value="All" className="space-y-px mt-4">
              {sortedHistory.map((action, index) => renderAction(action, index))}
            </TabsContent>

            <TabsContent value="Received" className="space-y-px mt-4">
              {sortedEarnedPoints.map((action, index) => renderAction(action, index))}
            </TabsContent>

            <TabsContent value="Used" className="space-y-px mt-4">
              {sortedRedeemedPoints.map((action, index) => renderAction(action, index))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default HistoryPage
