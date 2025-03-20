import { useTranslate } from "@refinedev/core";
import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
  Map,
  ChevronRight,
} from "lucide-react";
import { cn, formattedDateAndTime, getMapLinks } from "@/lib/utils";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { Ticket } from "@/features/tickets/components/Ticket";
import { CheckInView } from "@/features/tickets/components/CheckInView";
import LoadingSpin from "@/components/loading/LoadingSpin";
import Pagination from "@/components/pagination/Pagination";
import type { Ticket as TicketType } from "@/features/tickets/services/ticketService";
import NoItemsComp from "@/components/ui/no-items";
import ItemCarousel from "@/components/ui/item-carousel";
import TicketsSkeletons from "@/components/skeletons/TicketsSkeletons";

const ITEMS_PER_PAGE = 10;

export default function TicketsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, ticketId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"upcoming" | "passed">(
    () => (searchParams.get("tab") as "upcoming" | "passed") || "upcoming"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [qrTicket, setQrTicket] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const {
    tickets,
    loading,
    error,
    refreshTickets,
    updateTicketStatus,
    checkTicketStatus,
  } = useTickets();

  // Update search params when tab changes
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Refresh tickets on initial page load
  useEffect(() => {
    refreshTickets();
  }, []); // Empty dependency array means this runs once on mount

  // Sort and filter logic for list view
  const sortedEvents = [...tickets].sort((a, b) => {
    const dateA = new Date(a.event?.start_datetime || "");
    const dateB = new Date(b.event?.start_datetime || "");
    return dateA.getTime() - dateB.getTime();
  });

  // Filter events based on tab without removing duplicates
  const filteredEvents = sortedEvents.filter((customerEvent) => {
    if (
      !customerEvent.event?.start_datetime ||
      !customerEvent.event?.end_datetime
    ) {
      return false;
    }
    const now = new Date();
    const endDate = new Date(customerEvent.event.end_datetime);

    if (activeTab === "upcoming") {
      return endDate > now;
    } else {
      return endDate <= now;
    }
  });

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // If we have an ID, we're in details view
  const isDetailsView = !!id;
  // Find the order and its details by order ID
  let foundOrder = null;
  let foundTicket = null;
  if (isDetailsView) {
    foundOrder = tickets.find((order) => order.order_id === id);
    if (foundOrder && ticketId) {
      foundTicket = foundOrder.tickets.find((t) => t.id === ticketId);
    }
  }

  // Handlers for ticket details
  const handleTicketCheckIn = (ticket: TicketType) => {
    setQrTicket(ticket.code);
    setShowCheckIn(true);
  };

  const handleTicketClick = (orderId: string, ticketId: string) => {
    // Navigate to the order details using both order_id and ticket_id
    navigate(`/tickets/${orderId}/${ticketId}${location.search}`);
  };

  const handleCloseCheckIn = async () => {
    if (qrTicket && foundOrder) {
      const ticket = foundOrder.tickets.find((t) => t.code === qrTicket);
      if (ticket) {
        const currentStatus = await checkTicketStatus(ticket.id);
        if (currentStatus == "used") {
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title={isDetailsView ? "Ticket Details" : "My Tickets"} />
        <TicketsSkeletons />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <PageHeader title={isDetailsView ? "Ticket Details" : "My Tickets"} />
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">
            {isDetailsView
              ? "Failed to load ticket details"
              : "Failed to load tickets"}
          </p>
        </div>
      </div>
    );
  }

  // Details View
  if (isDetailsView && foundOrder) {
    const status = getEventStatus(
      foundOrder.event?.start_datetime,
      foundOrder.event?.end_datetime
    );

    const images = foundOrder.event?.product?.images;
    console.log(foundOrder);

    return (
      <div className="bg-background">
        <PageHeader
          title="Ticket Details"
          className="bg-background/20 border-transparent"
          onBack={() => {
            // Navigate directly to tickets page with current search params
            navigate(`/tickets${location.search}`, { replace: true });
          }}
        />

        <div className="pt-14 pb-20">
          {/* Hero Section */}
          <div className="relative">
            <motion.div
              className="relative w-full aspect-square overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ItemCarousel
                images={images}
                image={foundOrder.event?.product?.images?.[0]?.url}
                name={foundOrder.event?.product?.name}
              />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {/* Event Info */}
            <div className="space-y-4">
              {/* Status Badge */}
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
                      : status === "upcoming"
                      ? "bg-[#007AFF]/10 text-[#007AFF]"
                      : "bg-[#8E8E93]/10 text-[#8E8E93]"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  {status === "ongoing"
                    ? "Ongoing"
                    : status === "upcoming"
                    ? "Upcoming"
                    : "Ended"}
                </div>
              </motion.div>

              <motion.h1
                className="text-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {foundOrder.event?.name}
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
                    {foundOrder.event?.venue_name || "To be determined"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-light">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {format(
                      toZonedTime(
                        new Date(foundOrder.event?.start_datetime || ""),
                        "UTC"
                      ),
                      formattedDateAndTime
                    )}{" "}
                    -{" "}
                    {format(
                      toZonedTime(
                        new Date(foundOrder.event?.end_datetime || ""),
                        "UTC"
                      ),
                      formattedDateAndTime
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-light">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {foundOrder.tickets?.length}{" "}
                    {foundOrder.tickets?.length === 1 ? "ticket" : "tickets"}
                  </span>
                </div>
              </motion.div>
            </div>

            {foundOrder.event?.venue_address && (
              <div className="space-y-2">
                <h2 className="text-base">{t("Venue & Location")}</h2>
                {/* Get processed map links */}
                {(() => {
                  const { viewLink, embedLink, isShareLink } = getMapLinks(
                    foundOrder.event?.google_maps_link || ""
                  );

                  if (!viewLink) return null;

                  if (isShareLink) {
                    return (
                      <button
                        onClick={() =>
                          window.open(viewLink, "_blank", "noopener,noreferrer")
                        }
                        className="flex items-center justify-between p-4 rounded-lg bg-darkgray w-full"
                      >
                        <div className="flex items-center gap-3">
                          <Map className="w-5 h-5 text-white" />
                          {t("View map")}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    );
                  }

                  if (embedLink) {
                    return (
                      <iframe
                        src={embedLink}
                        style={{
                          border: 0,
                          width: "100%",
                          borderRadius: "12px",
                          height: "50vw",
                          maxHeight: "270px",
                        }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    );
                  }

                  return null;
                })()}

                <p className="text-sm text-secondary-foreground font-light">
                  {foundOrder.event?.venue_address}
                </p>
              </div>
            )}

            {/* Tickets List */}
            <div className="space-y-4">
              {foundOrder.tickets?.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  className="bg-darkgray rounded-lg p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F8F8F81A] flex items-center justify-center">
                        <TicketIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{ticket.code}</h3>
                        {/* TODO: fetch the dynamic variant that users have purchased in case the events have variants */}
                        <p className="text-muted-foreground">varianttest</p>
                      </div>
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
                        {ticket.metadata?.customerName ||
                          t("General Admission")}
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2.5 !bg-mainbutton rounded-full !text-black"
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
                id:
                  foundOrder.tickets?.find((t) => t.code === qrTicket)?.id ||
                  "",
                ticketNumber: qrTicket,
                eventName: foundOrder.event?.name || "",
                seat:
                  foundOrder.tickets?.find((t) => t.code === qrTicket)?.metadata
                    ?.customerName || "",
                date: foundOrder.event?.start_datetime || "",
                location: foundOrder.event?.venue_name || t("To be determined"),
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
          value={activeTab}
          defaultValue={activeTab}
          onValueChange={(value) => {
            const newTab = value as "upcoming" | "passed";
            setActiveTab(newTab);
            setSearchParams({ tab: newTab });
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
                  {currentEvents.map((customerEvent, index) => (
                    <motion.div
                      key={customerEvent.order_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() =>
                        handleTicketClick(
                          customerEvent.order_id,
                          customerEvent.tickets[0].id
                        )
                      }
                      className="cursor-pointer"
                    >
                      <Ticket
                        ticket={{
                          id: customerEvent.order_id,
                          eventName: customerEvent.event?.name,
                          location: customerEvent.event?.venue_name,
                          date: customerEvent.event?.start_datetime,
                          endDate: customerEvent.event?.end_datetime,
                          image:
                            customerEvent.event?.product.images[0]?.url || "",
                          status: getEventStatus(
                            customerEvent.event?.start_datetime,
                            customerEvent.event?.end_datetime
                          ),
                          used: customerEvent.tickets[0].status === "used",
                          ticketNumber: customerEvent.tickets[0].code,
                          seat:
                            customerEvent.tickets[0].metadata.customerName ||
                            "General Admission",
                          groupSize: customerEvent.tickets.length,
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
