import Header from "@/components/main/Header"
import { useState } from "react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type PointActionTypes = "Received" | "Used"

interface PointActionsProps {
  type: PointActionTypes
  date: string
  amount: number
}

const HistoryPage = () => {

  const tabClassNames = "font-semibold w-full bg-transparent text-[#6D6D6D] data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D]"

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
  ])

  // Utility to render action content
  const renderAction = (action: PointActionsProps) => {
    const actionTitle = action.type === "Received" ? "Get Point" : "Spend Point"

    return (
      <div key={`${action.type}-${action.date}`} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-1.5">
          <div className="border border-[#252525] rounded-full h-9 w-9 flex items-center justify-center">
            {/* Replace with icons */}
            {action.type === "Received" ? "下" : "上"}
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm">{actionTitle}</h3>
            <p className="text-[#6D6D6D] text-xs">{action.date}</p>
          </div>
        </div>

        <p className={cn("font-semibold text-sm", {"text-[#EE3636]": action.type === "Used"})}>{Number(action.amount).toFixed(2)}</p>
      </div>
    )
  }

  return (
    <>
      <Header title="History" navigateBackTo={-1} rightButton="Detail"/>

      <Tabs defaultValue="All">
        <TabsList className="w-full bg-[#303030] border border-input">
          <TabsTrigger value="All" className={tabClassNames}>All</TabsTrigger>
          <TabsTrigger value="Received" className={tabClassNames}>Received</TabsTrigger>
          <TabsTrigger value="Used" className={tabClassNames}>Spend</TabsTrigger>
        </TabsList>
        <TabsContent value="All">
          {pointActions.map(action => renderAction(action))}
        </TabsContent>

        <TabsContent value="Received">
          {pointActions
            .filter(action => action.type === "Received")
            .map(action => renderAction(action))
          }
        </TabsContent>

        <TabsContent value="Used">
          {pointActions
            .filter(action => action.type === "Used")
            .map(action => renderAction(action))
          }
        </TabsContent>
      </Tabs>
    </>
  )
}

export default HistoryPage