import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { PageHeader } from "@/components/shared/PageHeader";
import { CheckInView } from "../components/CheckInView";
import { useTickets } from "../hooks/useTickets";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, Calendar, Users } from "lucide-react";
import { cn, formattedDateAndTime } from "@/lib/utils";
import { useTranslate } from "@refinedev/core";
import type { CustomerEvent, Ticket } from "../services/ticketService";

export default function TicketDetailsPage() {
  const t = useTranslate();
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets } = useTickets();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const customerEvent = tickets.find((event) =>
    event.tickets.some((t) => t.id === id)
  );

  if (!customerEvent) {
    return null;
  }

  const ticket = customerEvent.tickets.find((t) => t.id === id);
  if (!ticket) {
    return null;
  }

  const eventDate = new Date(customerEvent.event.start_datetime);
  const isUpcoming = eventDate > new Date();

  const handleCheckIn = () => {
    setSelectedTicket(ticket.id);
    setShowCheckIn(true);
  };

  const handleCloseCheckIn = () => {
    setShowCheckIn(false);
    setSelectedTicket(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("Ticket Details")} onBack={() => navigate(-1)} />

      <div className="p-5 space-y-6">
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
                  "bg-[#007AFF]/10 text-[#007AFF]"
                )}
              >
                <Clock className="w-4 h-4" />
                {t("Upcoming Event")}
              </div>
            </motion.div>
          )}

          <motion.h1
            className="text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {customerEvent.event.name}
          </motion.h1>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 text-sm font-light">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>
                {customerEvent.event.venue_name || t("To be determined")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-light">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {format(
                  toZonedTime(
                    new Date(customerEvent.event.start_datetime),
                    "UTC"
                  ),
                  formattedDateAndTime
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-light">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{t("1 Ticket")}</span>
            </div>
          </motion.div>
        </div>

        {/* Ticket Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium tracking-wide">
            {t("Ticket Details")}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("Ticket Number")}
              </span>
              <span className="text-sm font-medium">{ticket.code}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("Status")}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  ticket.status === "used" ? "text-[#8E8E93]" : "text-[#007AFF]"
                )}
              >
                {ticket.status === "used" ? t("Used") : t("Unused")}
              </span>
            </div>
          </div>
        </div>

        {/* Check In Button */}
        {!isUpcoming && ticket.status !== "used" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleCheckIn}
              className="w-full py-4 rounded-lg bg-[#007AFF] text-foreground font-medium"
            >
              {t("Check In")}
            </button>
          </motion.div>
        )}
      </div>

      {/* Check In View */}
      <AnimatePresence>
        {showCheckIn && selectedTicket && (
          <CheckInView
            ticket={{
              id: selectedTicket,
              ticketNumber: selectedTicket,
              eventName: customerEvent.event.name,
              seat: ticket.metadata.attendeeName || "",
              date: customerEvent.event.start_datetime,
              location: customerEvent.event.venue_name || t("To be determined"),
            }}
            onClose={handleCloseCheckIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
