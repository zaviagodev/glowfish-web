import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon } from "lucide-react";
import { Ticket as TicketCard } from "./Ticket";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const eventDate = new Date(event.start_datetime);
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
        <div className="flex items-center justify-center py-12">
          <p>{t("Loading...")}</p>
        </div>
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
                {t("Past Events")}
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
                    : t("No past events")}
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
                          location: event.venue_name || "TBD",
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
                  <div className="flex justify-center items-center gap-2 mt-8 px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "w-8 h-8",
                              currentPage === page &&
                                "bg-primary text-primary-foreground"
                            )}
                          >
                            {page}
                          </Button>
                        )
                      )}
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
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
