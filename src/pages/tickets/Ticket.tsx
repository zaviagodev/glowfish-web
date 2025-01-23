import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, isFuture, isToday } from "date-fns";
import { MapPin, Calendar, QrCode, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TicketProps {
  ticket: {
    id: string;
    eventName: string;
    location: string;
    date: string;
    image: string;
    status: "upcoming" | "passed";
    used: boolean;
    ticketNumber: string;
    seat: string;
    groupSize?: number;
  };
}

export function Ticket({ ticket }: TicketProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all",
        "bg-gradient-to-br from-white to-[#F8F8F8]",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]",
        ticket.status === "passed" && "opacity-60"
      )}
      whileHover={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10" />
      
      {/* Content */}
      <div className="relative">
        {/* Image Section */}
        <div className="relative aspect-[2/1] overflow-hidden">
          <img 
            src={ticket.image} 
            alt={ticket.eventName}
            className="w-full h-full object-cover"
          />
          {/* Status Badge */}
          <div 
            className={cn(
              "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium",
              ticket.used
                ? "bg-[#8E8E93]/10 text-[#8E8E93]"
                : "bg-[#34C759]/10 text-[#34C759]"
            )}
          >
            {ticket.used ? t("Used") : t("Valid")}
          </div>
        </div>

        {/* Event Details */}
        <div className="p-4">
          {/* Countdown Badge */}
          {ticket.status === "upcoming" && (
            <div className="mb-3">
              <div 
                className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                  isToday(new Date(ticket.date))
                    ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                    : "bg-[#007AFF]/10 text-[#007AFF]"
                )}
              >
                {isToday(new Date(ticket.date))
                  ? t("Today!")
                  : isFuture(new Date(ticket.date))
                    ? t("In {{time}}", {
                        time: formatDistanceToNow(new Date(ticket.date), { addSuffix: false })
                      })
                    : t("Event Passed")
                }
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold mb-2">
            {ticket.eventName}
          </h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{ticket.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{format(new Date(ticket.date), "PPp")}</span>
            </div>
            {ticket.groupSize && ticket.groupSize > 1 && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{t("{{count}} ticket", { count: ticket.groupSize })}</span>
              </div>
            )}
          </div>

       
        </div>
      </div>

      {/* Decorative notches */}
      <div className="absolute -left-2 top-1/2 w-4 h-4 bg-background rounded-full" />
      <div className="absolute -right-2 top-1/2 w-4 h-4 bg-background rounded-full" />
    </motion.div>
  );
}