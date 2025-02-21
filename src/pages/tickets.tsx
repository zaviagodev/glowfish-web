import { useTranslate } from "@refinedev/core";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  QrCode,
  Ticket as TicketIcon,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { Ticket } from "@/features/tickets/components/Ticket";
import { CheckInView } from "@/features/tickets/components/CheckInView";
import LoadingSpin from "@/components/loading/LoadingSpin";
import Pagination from "@/components/pagination/Pagination";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import type { Ticket as TicketType } from '../features/tickets/services/ticketService';

const ITEMS_PER_PAGE = 10;

export default function TicketsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"upcoming" | "passed">("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const [qrTicket, setQrTicket] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { tickets, loading, error, refreshTickets, updateTicketStatus, checkTicketStatus } = useTickets();

  // Refresh tickets on initial page load
  useEffect(() => {
    refreshTickets();
  }, []); // Empty dependency array means this runs once on mount

  // If we have an ID, we're in details view
  const isDetailsView = !!id;
  // Find the order and its details
  let foundOrder = null;
  if (isDetailsView) {
    foundOrder = tickets.find(order => order.order_id === id);
  }

  // Handlers for ticket details
  const handleTicketCheckIn = (ticket: TicketType) => {
    setQrTicket(ticket.code);
    setShowCheckIn(true);
  };

  const handleTicketClick = (orderId: string) => {
    navigate(`/tickets/${orderId}`);
  };

  const handleCloseCheckIn = async () => {
    if (qrTicket && foundOrder) {
      const ticket = foundOrder.tickets.find(t => t.code === qrTicket);
      if (ticket) {
        const currentStatus = await checkTicketStatus(ticket.id);
        if (currentStatus == 'used') {
          await refreshTickets();
        }
      }
    }
    setQrTicket(null);
    setShowCheckIn(false);
  };

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return "upcoming";
    if (now > end) return "passed";
    return "ongoing";
  };

  // Sort and filter logic for list view
  const sortedEvents = [...tickets].sort((a, b) => {
    const dateA = new Date(a.event.end_datetime);
    const dateB = new Date(b.event.end_datetime);
    const now = new Date();
    return (
      Math.abs(dateA.getTime() - now.getTime()) -
      Math.abs(dateB.getTime() - now.getTime())
    );
  });

  const filteredEvents = sortedEvents.filter((customerEvent) => {
    const status = getEventStatus(customerEvent.event.start_datetime, customerEvent.event.end_datetime);
    if (activeTab === "upcoming") {
      return status === "upcoming" || status === "ongoing";
    }
    return status === "passed";
  });

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const currentEvents = filteredEvents.slice(
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
        <PageHeader title={isDetailsView ? "Ticket Details" : "My Tickets"} />
        <LoadingSpin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <PageHeader title={isDetailsView ? "Ticket Details" : "My Tickets"} />
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">
            {isDetailsView ? "Failed to load ticket details" : "Failed to load tickets"}
          </p>
        </div>
      </div>
    );
  }

  // Details View
  if (isDetailsView && foundOrder) {
    const status = getEventStatus(foundOrder.event.start_datetime, foundOrder.event.end_datetime);
    const isUpcoming = status === "upcoming" || status === "ongoing";

    return (
      <div className="bg-background">
        <PageHeader
          title="Ticket Details"
          className="bg-background/20 border-transparent"
          onBack={() => navigate("/tickets")}
        />

        <div className="pt-14 pb-20">
          {/* Hero Section */}
          <div className="relative">
            <motion.div
              className="relative w-full aspect-[4/3] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {foundOrder.event.product.images[0]?.url ? (
                <img
                  src={foundOrder.event.product.images[0].url}
                  alt={foundOrder.event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full overflow-hidden bg-white/20">
                  <GlowfishIcon />
                </div>
              )}
              {/* Status Badge */}
              <div
                className={cn(
                  "absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium",
                  status === "passed"
                    ? "bg-[#8E8E93]/10 text-[#8E8E93]"
                    : status === "ongoing"
                    ? "bg-[#FF9500]/10 text-[#FF9500]"
                    : "bg-[#34C759]/10 text-[#34C759]"
                )}
              >
                {status === "passed" ? "Ended" : status === "ongoing" ? "Ongoing" : "Upcoming"}
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Event Info */}
            <div className="space-y-4">
              {/* Status Badge */}
              {isUpcoming && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                      status === "ongoing"
                        ? "bg-[#FF9500]/10 text-[#FF9500]"
                        : "bg-[#007AFF]/10 text-[#007AFF]"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {status === "ongoing" ? "Ongoing Event" : "Upcoming Event"}
                  </div>
                </motion.div>
              )}

              <motion.h1
                className="text-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {foundOrder.event.name}
              </motion.h1>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 text-sm font-light">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{foundOrder.event.venue_name || "To be determined"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-light">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {format(new Date(foundOrder.event.start_datetime), "PPp")} - {format(new Date(foundOrder.event.end_datetime), "PPp")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-light">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{foundOrder.tickets.length} {foundOrder.tickets.length === 1 ? "Ticket" : "Tickets"}</span>
                </div>
              </motion.div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              {foundOrder.tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  className="bg-darkgray rounded-lg p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F8F8F81A] flex items-center justify-center">
                        <TicketIcon className="w-5 h-5 text-primary" />
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
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleTicketCheckIn(ticket);
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {t("Show QR")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showCheckIn && qrTicket && (
            <CheckInView
              ticket={{
                id: foundOrder.tickets.find(t => t.code === qrTicket)?.id || "",
                ticketNumber: qrTicket,
                eventName: foundOrder.event.name,
                seat: foundOrder.tickets.find(t => t.code === qrTicket)?.metadata.attendeeName || "",
                date: foundOrder.event.start_datetime,
                location: foundOrder.event.venue_name || t("To be determined"),
              }}
              onClose={handleCloseCheckIn}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-background">
      <PageHeader title="My Tickets" />

      <div className="pt-14 pb-4">
        <Tabs
          defaultValue="upcoming"
          onValueChange={(value) => {
            setActiveTab(value as "upcoming" | "passed");
            setCurrentPage(1);
          }}
        >
          <div className="px-4">
            <TabsList className="w-full h-auto p-1 bg-tertiary grid grid-cols-2 gap-1">
              <TabsTrigger
                value="upcoming"
                className="text-sm py-2.5 data-[state=active]:bg-background"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="passed"
                className="text-sm py-2.5 data-[state=active]:bg-background"
              >
                Ended
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4">
            {currentEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-5"
              >
                <TicketIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  {activeTab === "upcoming"
                    ? "No upcoming events"
                    : "No ended events"}
                </p>
              </motion.div>
            ) : (
              <>
                <div className="px-5 space-y-4">
                  {currentEvents.map((customerEvent, index) => (
                    <motion.div
                      key={customerEvent.order_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTicketClick(customerEvent.order_id)}
                      className="cursor-pointer"
                    >
                      <Ticket
                        ticket={{
                          id: customerEvent.order_id,
                          eventName: customerEvent.event.name,
                          location: customerEvent.event.venue_name || "To be determined",
                          date: customerEvent.event.start_datetime,
                          endDate: customerEvent.event.end_datetime,
                          image: customerEvent.event.product.images[0]?.url || "",
                          status: getEventStatus(customerEvent.event.start_datetime, customerEvent.event.end_datetime),
                          used: customerEvent.tickets[0].status === "used",
                          ticketNumber: customerEvent.tickets[0].code,
                          seat: customerEvent.tickets[0].metadata.attendeeName || "General Admission",
                          groupSize: customerEvent.tickets.length
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
