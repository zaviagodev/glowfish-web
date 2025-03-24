import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket as TicketIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "../components/Ticket";
import { useTickets } from "../hooks/useTickets";
import LoadingSpin from "@/components/loading/LoadingSpin";
import Pagination from "@/components/pagination/Pagination";
import NoItemsComp from "@/components/ui/no-items";

const ITEMS_PER_PAGE = 10;

export default function TicketsPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "passed">("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const { tickets, loading, error, refreshTickets } = useTickets();

  // Sort events by closest start date
  const sortedTickets = [...tickets].sort((a, b) => {
    const dateA = new Date(a.event?.start_datetime || "");
    const dateB = new Date(b.event?.start_datetime || "");
    const now = toZonedTime(new Date(), "UTC");
    return (
      Math.abs(dateA.getTime() - now.getTime()) -
      Math.abs(dateB.getTime() - now.getTime())
    );
  });

  const filteredTickets = sortedTickets.filter((ticket) => {
    if (!ticket.event?.end_datetime) {
      return false;
    }
    const eventDate = toZonedTime(new Date(ticket.event.end_datetime), "UTC");
    if (isNaN(eventDate.getTime())) {
      return false;
    }
    const isUpcoming = eventDate > toZonedTime(new Date(), "UTC");
    const shouldInclude = activeTab === "upcoming" ? isUpcoming : !isUpcoming;
    return shouldInclude;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);

  // Get current page tickets
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            {currentTickets.length === 0 ? (
              <NoItemsComp
                icon={TicketIcon}
                text={
                  activeTab === "upcoming"
                    ? "No upcoming events"
                    : "No ended events"
                }
              />
            ) : (
              <>
                <div className="px-5 space-y-4">
                  {currentTickets.map((customerEvent, index) => (
                    <motion.div
                      key={customerEvent.order_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Ticket
                        ticket={{
                          id: customerEvent.order_id,
                          eventName: customerEvent.event?.name || "",
                          location:
                            customerEvent.event?.venue_name ||
                            "To be determined",
                          date: customerEvent.event?.start_datetime || "",
                          endDate: customerEvent.event?.end_datetime || "",
                          image:
                            customerEvent.event?.product?.images?.[0]?.url ||
                            "",
                          status: activeTab,
                          used: customerEvent.tickets?.[0]?.status === "used",
                          ticketNumber: customerEvent.tickets?.[0]?.code || "",
                          seat:
                            customerEvent.tickets?.[0]?.metadata
                              ?.attendeeName || "General Admission",
                          groupSize: 1,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
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
