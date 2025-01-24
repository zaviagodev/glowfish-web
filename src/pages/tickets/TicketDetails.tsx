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

export default function TicketDetails() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { id } = useParams();
  const { events, loading, error } = useEvents();
  const event = events.find((e) => e.id === id);
  if (!event) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
        <PageHeader title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p>{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <PageHeader title={t("Event Details")} />

      <div className="pt-14 pb-32">
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
          <div className="space-y-4">
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
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {event.event.name}
            </motion.h1>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{event.event.location || t("Location TBD")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{format(eventDate, "PPp")}</span>
              </div>
              {event.tickets.length > 1 && (
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {t("{{count}} Ticket", { count: event.tickets.length })}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Ticket Details */}

          {event.tickets.map((ticket, index) => (
            <motion.div
              className="bg-tertiary rounded-lg border border-[#E5E5E5] p-4 space-y-6"
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
          ))}

          {/* Description */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-medium">{t("Description")}</h3>
            <p className="text-sm text-muted-foreground">
              {event.event.description}
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
            <div className="bg-tertiary rounded-lg border border-[#E5E5E5] p-4">
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
            className="w-full bg-black text-white hover:bg-black/90 h-12"
            onClick={() => setShowCheckIn(true)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            {t("Check In All")}
          </Button>
        </div>
      )}

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <CheckInView
            ticket={{
              id: selectedTicket.id,
              eventName: event.event.name,
              location: event.event.location || t("Location TBD"),
              date: event.event.start_datetime,
              image: event.event.images || "",
              status: isUpcoming ? "upcoming" : "passed",
              used: !isUpcoming,
              ticketNumber: selectedTicket.code,
              seat: selectedTicket
                ? event.tickets.find((t) => t.id === selectedTicket)?.metadata
                    ?.attendeeName || t("General Admission")
                : event.tickets[0]?.metadata?.attendeeName ||
                  t("General Admission"),
            }}
            onClose={handleCloseCheckIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
