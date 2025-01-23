import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon } from "lucide-react";
import { Ticket as TicketCard } from "./Ticket";
import { useEvents } from "@/hooks/useEvents";

export default function TicketsPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "passed">("upcoming");
  const { events, loading, error } = useEvents();

  const filteredTickets = events.filter(event => {
    const eventDate = new Date(event.event.start_datetime);
    const isUpcoming = eventDate > new Date();
    return activeTab === "upcoming" ? isUpcoming : !isUpcoming;
  });

  console.log(events);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={t("My Tickets")} />
        <div className="flex items-center justify-center py-12">
          <p>{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={t("My Tickets")} />
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">{t("Failed to load tickets")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("My Tickets")} />

      <div className="pt-14 pb-4">
        <Tabs defaultValue="upcoming" onValueChange={(value) => setActiveTab(value as "upcoming" | "passed")}>
          <div className="px-4">
            <TabsList className="w-full h-auto p-1 bg-[rgba(245,245,245,0.5)] grid grid-cols-2 gap-1">
              <TabsTrigger 
                value="upcoming" 
                className="text-sm py-2.5 data-[state=active]:bg-white"
              >
                {t("Upcoming")}
              </TabsTrigger>
              <TabsTrigger 
                value="passed"
                className="text-sm py-2.5 data-[state=active]:bg-white"
              >
                {t("Past Events")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4">
            {filteredTickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-4"
              >
                <TicketIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  {activeTab === "upcoming" 
                    ? t("No upcoming events") 
                    : t("No past events")}
                </p>
              </motion.div>
            ) : (
              <div className="px-4 space-y-4">
                {filteredTickets.map((event, index) => (
                  <motion.div
                    key={event.order_item_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TicketCard 
                      ticket={{
                        id: event.id,
                        eventName: event.event.name,
                        location: event.event.venue_name || "TBD",
                        date: event.event.start_datetime,
                        image: event.event.images || "",
                        status: activeTab,
                        used: activeTab === "passed",
                        ticketNumber: `T-${event.order_item_id}`,
                        seat: event.tickets[0]?.metadata?.attendeeName || "General Admission",
                        groupSize: event.tickets.length || 1
                      }} 
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}