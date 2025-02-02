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
  const event = events.find(e => e.event_id === id);

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
  
  const handleTicketCheckIn = (ticketCode: string) => {
    setSelectedTicket(ticketCode);
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
          <p className="text-destructive">{t("Failed to load event details")}</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.start_datetime);
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
              src={event.image_url || ""}
              alt={event.event_name}
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
                          time: formatDistanceToNow(eventDate, { addSuffix: false })
                        })
                      : t("Event Passed")
                  }
                </div>
              </motion.div>
            )}

            <motion.h1
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {event.event_name}
            </motion.h1>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{event.venue_name || t("Location TBD")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{format(eventDate, "PPp")}</span>
              </div>
              {event.ticket_details.length > 1 && (
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{t("{{count}} Ticket", { count: event.ticket_details.length })}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Ticket Details */}
          {event.ticket_details.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-4 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F8F8] flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium">{t("Ticket {{number}}", { number: index + 1 })}</h3>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-sm",
                    !isUpcoming ? "bg-[#8E8E93]/10 text-[#8E8E93]" : "bg-[#34C759]/10 text-[#34C759]"
                  )}>
                    {!isUpcoming ? t("Used") : t("Valid")}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("Ticket No.")}
                    </div>
                    <div className="text-sm font-medium">
                      {ticket.code}
                    </div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleTicketCheckIn(ticket.code)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {t("Show QR")}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Venue Details */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="font-medium">{t("Venue Details")}</h3>
            <div className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{event.venue_address || t("Address TBD")}</span>
              </div>
              {event.google_maps_link && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => event.google_maps_link && window.open(event.google_maps_link, '_blank')}
                >
                  {t("Open in Google Maps")}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Organizer Details */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="font-medium">{t("Organizer")}</h3>
            <div className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-4">
              <div className="text-sm font-medium mb-1">{event.organizer_name}</div>
              {event.organizer_contact && (
                <div className="text-sm text-muted-foreground">{event.organizer_contact}</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckIn && selectedTicket && (
          <CheckInView
            ticket={{
              code: selectedTicket,
              eventName: event.event_name,
              date: event.start_datetime,
              location: event.venue_name
            }}
            onClose={handleCloseCheckIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}