import { motion } from "framer-motion";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { MapPin, Calendar, Users, Image } from "lucide-react";
import { cn, formattedDateAndTime } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/hooks/useConfig";

interface TicketProps {
  ticket: {
    id: string;
    eventName: string;
    location: string;
    date: string;
    endDate: string;
    image: string;
    status: "upcoming" | "ongoing" | "passed";
    used: boolean;
    ticketNumber: string;
    seat: string;
    groupSize?: number;
  };
}

export function Ticket({ ticket }: TicketProps) {
  const navigate = useNavigate();
  const { config } = useConfig();
  const dateFormat = (date: string) =>
    format(toZonedTime(new Date(date), "UTC"), formattedDateAndTime);

  return (
    <motion.div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all bg-darkgray",
        ticket.status === "passed" && "opacity-60"
      )}
      whileHover={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Content */}
      <div className="relative grid grid-cols-3">
        {/* Image Section */}
        {ticket.image ? (
          <img
            src={ticket.image}
            alt={ticket.eventName}
            className="w-full h-full object-cover aspect-square object-top"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-darkgray w-full">
            <Image className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Event Details */}
        <div className="p-4 col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium mb-2 whitespace-pre overflow-hidden text-ellipsis">
              {ticket.eventName}
            </h3>
            {/* Status Badge */}
            <div className="mb-2">
              <div
                className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-pre gap-1",
                  ticket.status === "passed"
                    ? "bg-[#8E8E93]/10 text-[#8E8E93]"
                    : ticket.status === "ongoing"
                    ? "bg-[#FF9500]/10 text-[#FF9500]"
                    : isToday(toZonedTime(new Date(ticket.date), "UTC"))
                    ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                    : "bg-[#007AFF]/10 text-[#007AFF]"
                )}
              >
                {ticket.status === "passed"
                  ? "Ended"
                  : ticket.status === "ongoing"
                  ? "Ongoing"
                  : isToday(toZonedTime(new Date(ticket.date), "UTC"))
                  ? "Today!"
                  : `In ${formatDistanceToNow(
                      toZonedTime(new Date(ticket.date), "UTC"),
                      {
                        addSuffix: false,
                      }
                    )}`}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {ticket.location || "To be determined"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {ticket.date && ticket.endDate
                  ? ticket.date === ticket.endDate
                    ? dateFormat(ticket.date)
                    : `${dateFormat(ticket.date)} - ${dateFormat(
                        ticket.endDate
                      )}`
                  : "To be determined"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>
                {ticket.groupSize || 0}{" "}
                {ticket.groupSize === 1 ? "ticket" : "tickets"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
