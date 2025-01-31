import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon } from "lucide-react";
import { Ticket as TicketCard } from "./Ticket";
import { useEvents } from "@/hooks/useEvents";

// Mock data - replace with actual data fetching
const mockTickets = [
  {
    id: "4",
    eventName: "Upcoming Test Event",
    location: "Glowfish, Sathon",
    date: "2025-02-01T19:00:00", // Set this to a future date
    image: "https://picsum.photos/400/203",
    status: "upcoming",
    used: false,
    ticketNumber: "GA-2024-0201",
    seat: "General Admission",
    groupSize: 1,
  },
  {
    id: "1",
    eventName: "Jameson Live Music",
    location: "Glowfish, Sathon",
    date: "2025-02-15T19:00:00",
    image: "https://picsum.photos/400/200",
    status: "upcoming",
    used: false,
    ticketNumber: "GA-1234-5678",
    seat: "General Admission",
    groupSize: 5,
  },
  {
    id: "2",
    eventName: "Paradise Bangkok",
    location: "Glowfish, Sathon",
    date: "2025-03-20T20:00:00",
    image: "https://picsum.photos/400/201",
    status: "upcoming",
    used: false,
    ticketNumber: "VIP-8765-4321",
    seat: "VIP Section",
    groupSize: 2,
  },
  {
    id: "3",
    eventName: "Music Afterwork",
    location: "Glowfish, Sathon",
    date: "2024-01-10T18:30:00",
    image: "https://picsum.photos/400/202",
    status: "passed",
    used: true,
    ticketNumber: "GA-9876-5432",
    seat: "General Admission",
    groupSize: 3,
  },
];

export default function TicketsPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "passed">("upcoming");
  const { events, loading, error } = useEvents();

  // TODO : Will replace with the actual events
  // const filteredTickets = events.filter((event) => {
  //   const eventDate = new Date(event.event.start_datetime);
  //   const isUpcoming = eventDate > new Date();
  //   return activeTab === "upcoming" ? isUpcoming : !isUpcoming;
  // });

  // TODO: Will remove soon after the actual events are fetched
  const filteredTickets = mockTickets.filter((ticket) =>
    activeTab === "upcoming"
      ? ticket.status === "upcoming"
      : ticket.status === "passed"
  );

  if (loading) {
    return (
      <div className="bg-background pt-14">
        <PageHeader title={t("My Tickets")} />
        <div className="flex items-center justify-center py-12">
          <p>{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background pt-14">
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
          onValueChange={(value) =>
            setActiveTab(value as "upcoming" | "passed")
          }
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

          {/* TODO: Will remove it after the actual events are fetched */}
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
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TicketCard ticket={ticket} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* TODO: Will uncomment it after the actual events are fetched */}
          {/* <div className="mt-4">
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
                        seat:
                          event.tickets[0]?.metadata?.attendeeName ||
                          "General Admission",
                        groupSize: event.tickets.length || 1,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div> */}
        </Tabs>
      </div>
    </div>
  );
}
