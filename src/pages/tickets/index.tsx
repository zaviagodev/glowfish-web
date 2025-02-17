import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon } from "lucide-react";
import { Ticket as TicketCard } from "./Ticket";
import { useEvents } from "@/hooks/useEvents";
import LoadingSpin from "@/components/loading/LoadingSpin";
import Pagination from "@/components/pagination/Pagination";

const ITEMS_PER_PAGE = 10;

export default function TicketsPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "passed">("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const { events, total, loading, error } = useEvents({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  // Sort events by closest start date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.start_datetime);
    const dateB = new Date(b.start_datetime);
    const now = new Date();
    return (
      Math.abs(dateA.getTime() - now.getTime()) -
      Math.abs(dateB.getTime() - now.getTime())
    );
  });

  const filteredTickets = sortedEvents.filter((event) => {
    const eventDate = new Date(event.end_datetime);
    const isUpcoming = eventDate > new Date();
    return activeTab === "upcoming" ? isUpcoming : !isUpcoming;
  });

  // Calculate total pages from the server's total count
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title={t("My Tickets")} />
        <LoadingSpin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <PageHeader title={t("My Tickets")} />
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">{t("Failed to load tickets")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHeader title={t("My Tickets")} />

      <div className="pt-14 pb-4">
        <Tabs
          defaultValue="upcoming"
          onValueChange={(value) => {
            setActiveTab(value as "upcoming" | "passed");
            setCurrentPage(1); // Reset to first page when changing tabs
          }}
        >
          <div className="px-4">
            <TabsList className="w-full h-auto p-1 bg-tertiary grid grid-cols-2 gap-1">
              <TabsTrigger
                value="upcoming"
                className="text-sm py-2.5 data-[state=active]:bg-background"
              >
                {t("Upcoming")}
              </TabsTrigger>
              <TabsTrigger
                value="passed"
                className="text-sm py-2.5 data-[state=active]:bg-background"
              >
                {t("Ended")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4">
            {filteredTickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-5"
              >
                <TicketIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  {activeTab === "upcoming"
                    ? t("No upcoming events")
                    : t("No ended events")}
                </p>
              </motion.div>
            ) : (
              <>
                <div className="px-5 space-y-4">
                  {filteredTickets.map((event, index) => (
                    <motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TicketCard
                        ticket={{
                          id: event.event_id,
                          eventName: event.event_name,
                          location: event.venue_name || "To be determined",
                          date: event.start_datetime,
                          image: event.image_url || "",
                          status: activeTab,
                          used: activeTab === "passed",
                          ticketNumber: event.ticket_details[0]?.code || "",
                          seat:
                            event.ticket_details[0]?.metadata?.attendeeName ||
                            "General Admission",
                          groupSize: event.ticket_details.length || 1,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {total > ITEMS_PER_PAGE && (
                  <Pagination
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                    currentPage={currentPage}
                    hasNextPage={currentPage !== totalPages}
                    hasPreviousPage={currentPage !== 1}
                  />
                )}
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
