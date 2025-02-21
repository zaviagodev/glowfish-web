import { useTranslate } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { CheckInView } from "../components/CheckInView";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  QrCode,
  Ticket,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTickets } from "../hooks/useTickets";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import LoadingSpin from "@/components/loading/LoadingSpin";

export default function TicketDetailsPage() {
  const t = useTranslate();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { id } = useParams();
  const { tickets = [], loading, error, refreshTickets } = useTickets();
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="bg-background">
        <PageHeader
          title={t("Ticket Details")}
          className="bg-background/20 border-transparent"
        />
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

  const handleCloseCheckIn = async () => {
    setSelectedTicket(null);
    setShowCheckIn(false);
    await refreshTickets();
  };

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader
          title={t("Ticket Details")}
          className="bg-background/20 border-transparent"
        />
        <LoadingSpin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <PageHeader
          title={t("Ticket Details")}
          className="bg-background/20 border-transparent"
        />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-destructive">
            {t("Failed to load ticket details")}
          </p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(ticket.metadata.purchaseDate);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="bg-background">
      <PageHeader
        title={t("Ticket Details")}
        className="bg-background/20 border-transparent"
      />

      <div className="pt-14 pb-20">
        {/* Hero Section */}
        <div className="relative">
          <motion.div
            className="relative w-full aspect-[4/3] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-center w-full h-full overflow-hidden bg-white/20">
              <GlowfishIcon />
            </div>
            {/* Status Badge */}
            <div
              className={cn(
                "absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium",
                !isUpcoming
                  ? "bg-[#8E8E93]/10 text-[#8E8E93]"
                  : "bg-[#34C759]/10 text-[#34C759]"
              )}
            >
              {!isUpcoming ? t("Ended") : t("Upcoming")}
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
              {ticket.metadata.eventName}
            </motion.h1>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-sm font-light">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{t("To be determined")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-light">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{format(eventDate, "PPp")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-light">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{t("1 Ticket")}</span>
              </div>
            </motion.div>
          </div>

          {/* Ticket Details */}
          <motion.div
            className="bg-darkgray rounded-lg p-5 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F8F8F81A] flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium">
                    {ticket.code}
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

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("Attendee")}
                  </div>
                  <div className="text-sm font-medium">
                    {ticket.metadata.attendeeName || t("General Admission")}
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2.5"
                    onClick={() => handleTicketCheckIn(ticket.code)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {t("Show QR")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckIn && selectedTicket && (
          <CheckInView
            ticket={{
              id: selectedTicket,
              ticketNumber: selectedTicket,
              eventName: ticket.metadata.eventName,
              seat: ticket.metadata.attendeeName || "",
              date: ticket.metadata.purchaseDate,
              location: t("To be determined"),
            }}
            onClose={handleCloseCheckIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 