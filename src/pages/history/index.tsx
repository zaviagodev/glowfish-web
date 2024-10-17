import Header from "@/components/main/Header"
import { useState } from "react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "@/components/icons/MainIcons"
import { useTranslate } from "@refinedev/core"

type PointActionTypes = "Received" | "Used"

interface PointActionsProps {
  type: PointActionTypes
  date: string
  amount: number
}

const HistoryPage = () => {

  const t = useTranslate();
  const tabClassNames = "font-semibold w-full bg-transparent text-[#6D6D6D] data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D]";

  // These data are the mock-up ones, will be changed to the dynamic data
  const [pointActions, setPointActions] = useState<PointActionsProps[]>([
    {
      type: "Received",
      date: "Feb 10",
      amount: 123
    },
    {
      type: "Used",
      date: "Feb 09",
      amount: -25
    },
    {      
      type: "Received",
      date: "Feb 09",
      amount: 35  
    }
  ]);

  const renderAction = (action: PointActionsProps) => {
    const actionTitle = action.type === "Received" ? t("Get Point") : t("Spend Point")

    return (
      <div key={`${action.type}-${action.date}`} className="flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="border border-[#252525] rounded-full h-9 w-9 flex items-center justify-center">
            {action.type === "Received" ? <ArrowDown /> : <ArrowUp />}
          </div>

          <div className="space-y-1">
            <h3 className="page-title">{actionTitle}</h3>
            <p className="text-[#6D6D6D] text-xs">{t(action.type)} • {action.date}</p>
          </div>
        </div>

        <p className={cn("page-title", {"text-[#EE3636]": action.type === "Used"})}>{Number(action.amount).toFixed(2)}</p>
      </div>
    )
  }

  return (
    <>
      <Header title={t("History")} rightButton={t("Detail")}/>
      <Tabs defaultValue="All">
        <TabsList className="w-full bg-darkgray border border-input">
          <TabsTrigger value="All" className={tabClassNames}>{t("All")}</TabsTrigger>
          <TabsTrigger value="Received" className={tabClassNames}>{t("Received")}</TabsTrigger>
          <TabsTrigger value="Used" className={tabClassNames}>{t("Spend")}</TabsTrigger>
        </TabsList>
        <TabsContent value="All">
          <div className="mt-10">{pointActions.map(action => renderAction(action))}</div>
        </TabsContent>

        <TabsContent value="Received">
          <div className="mt-10">
            {pointActions
              .filter(action => action.type === "Received")
              .map(action => renderAction(action))
            }
          </div>
        </TabsContent>

        <TabsContent value="Used">
          <div className="mt-10">
            {pointActions
              .filter(action => action.type === "Used")
              .map(action => renderAction(action))
            }
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default HistoryPage