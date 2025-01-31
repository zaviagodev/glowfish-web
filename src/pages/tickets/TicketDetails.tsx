import { useTranslate } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format, formatDistanceToNow, isFuture, isToday } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { CheckInView } from "./CheckInView";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, QrCode, Ticket, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useEvents";

// Mock data - replace with actual data fetching
const mockTickets = [
  {
    id: "4",
    eventName: "Upcoming Test Event",
    location: "Glowfish, Sathon",
    date: "2025-02-01T19:00:00",
    image: "https://picsum.photos/400/203",
    status: "upcoming",
    used: false,
    ticketNumber: "GA-2024-0201",
    seat: "General Admission",
    groupSize: 1,
    tickets: 10,
    description:
      "Join us for an amazing evening of entertainment and networking.",
    venue: {
      name: "Glowfish Sathon",
      address:
        "Sathorn Square Office Tower, 98 N Sathon Rd, Silom, Bang Rak, Bangkok 10500",
      googleMapsUrl: "https://maps.google.com",
    },
    event: {
      start_datetime: "2025-02-01T19:00:00",
      images: "https://picsum.photos/400/203",
      name: "Upcoming Event",
      location: "Glowfish",
    },
  },
];

export default function TicketDetails() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { id } = useParams();
  const { events, loading, error } = useEvents();

  // TODO: Will replace with actual events
  // const event = events.find((e) => e.id === id);

  const event = mockTickets.find((e) => e.id === id);
  if (!event) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeader title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">{t("Ticket not found")}</p>
        </div>
      </div>
    );
  }

  const handleTicketCheckIn = (ticket: string) => {
    setSelectedTicket(ticket);
    setShowCheckIn(true);
  };

  const handleCloseCheckIn = () => {
    setSelectedTicket(null);
    setShowCheckIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeader title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p>{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeader title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-destructive">
            {t("Failed to load event details")}
          </p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event.start_datetime);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title={t("Event Details")} />

      <div className="pt-14 pb-20">
        {/* Hero Section */}
        <div className="relative">
          <motion.div
            className="relative w-full aspect-[4/3] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img
              src={event.event.images || ""}
              alt={event.event.name}
              className="w-full h-full object-cover"
            />
            {/* Status Badge */}
            <div
              className={cn(
                "absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium",
                !isUpcoming
                  ? "bg-[#8E8E93]/10 text-[#8E8E93]"
                  : "bg-[#34C759]/10 text-[#34C759]"
              )}
            >
              {!isUpcoming ? t("Used") : t("Valid")}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Info */}
          <div className="space-y-2">
            {/* Countdown */}
            {isUpcoming && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                    isToday(eventDate)
                      ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                      : "bg-[#007AFF]/10 text-[#007AFF]"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  {isToday(eventDate)
                    ? t("Today!")
                    : isFuture(eventDate)
                    ? t("In {{time}}", {
                        time: formatDistanceToNow(eventDate, {
                          addSuffix: false,
                        }),
                      })
                    : t("Event Passed")}
                </div>
              </motion.div>
            )}

            <motion.h1
              className="text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {event.event.name}
            </motion.h1>

            <motion.div
              className="space-y-2 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-sm font-light">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{event.event.location || t("Location TBD")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-light">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{format(eventDate, "PPp")}</span>
              </div>
              {/* {event.tickets.length > 1 && (
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {t("ticket", { count: event.tickets.length })}
                  </span>
                </div>
              )} */}
              <div className="flex items-center gap-2 text-sm font-light">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{t("ticket", { count: 10 })}</span>
              </div>
            </motion.div>
          </div>

          {/* Ticket Details */}
          <motion.div
            className="bg-darkgray rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F8F8F81A] flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t("Ticket Details")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Your ticket information")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {t("Ticket No.")}
                </div>
                <div className="text-sm font-medium">{event.ticketNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {t("Seat")}
                </div>
                <div className="text-sm font-medium">{event.seat}</div>
              </div>
            </div>
          </motion.div>

          {/* Not sure this one is still being used or not, so I commented it */}
          {/* {event.tickets.map((ticket, index) => (
            <motion.div
              className="bg-darkgray rounded-lg p-4 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div key={ticket.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium">
                      {t("Ticket {{number}}", { number: index + 1 })}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "px-2 py-1 rounded-full text-sm",
                      ticket.status === "used"
                        ? "bg-[#8E8E93]/10 text-[#8E8E93]"
                        : "bg-[#34C759]/10 text-[#34C759]"
                    )}
                  >
                    {ticket.status === "used" ? t("Used") : t("Valid")}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("Ticket No.")}
                    </div>
                    <div className="text-sm font-medium">{ticket.code}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("Attendee")}
                    </div>
                    <div className="text-sm font-medium">
                      {ticket.metadata?.attendeeName || t("General Admission")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1"></div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleTicketCheckIn(ticket)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {t("Show QR")}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))} */}

          {/* Description */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-medium">{t("Description")}</h3>
            <p className="text-[13px] text-secondary-foreground">
              {/* {event.event.description} */}
              THIS IS A DESCRIPTION
            </p>
          </motion.div>

          {/* Venue Details */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="font-medium">{t("Venue")}</h3>
            <div className="bg-darkgray rounded-lg p-4">
              <h4 className="font-medium mb-1">
                {event.event.venue_name || t("Venue TBD")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {event.event.venue_address || t("Address TBD")}
              </p>
              {event.event.google_maps_link && (
                <a
                  href={event.event.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/90"
                >
                  {t("View on Google Maps")}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      {isUpcoming && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t p-4">
          <Button
            className="w-full main-btn flex items-center gap-2"
            onClick={() => setShowCheckIn(true)}
          >
            <QrCode className="w-4 h-4" />
            {t("Check In")}
          </Button>
        </div>
      )}

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <CheckInView
            ticket={event}
            // ticket={{
            //   id: selectedTicket.id,
            //   eventName: event.event.name,
            //   location: event.event.location || t("Location TBD"),
            //   date: event.event.start_datetime,
            //   image: event.event.images || "",
            //   status: isUpcoming ? "upcoming" : "passed",
            //   used: !isUpcoming,
            //   ticketNumber: selectedTicket.code,
            //   seat: selectedTicket
            //     ? event.tickets.find((t) => t.id === selectedTicket)?.metadata
            //         ?.attendeeName || t("General Admission")
            //     : event.tickets[0]?.metadata?.attendeeName ||
            //       t("General Admission"),
            // }}
            onClose={handleCloseCheckIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
