import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MapPin, Calendar, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface CheckInViewProps {
  ticket: {
    id: string;
    ticketNumber: string;
    eventName: string;
    seat: string;
    date: string;
    location: string;
  };
  onClose: () => void;
}

export function CheckInView({ ticket, onClose }: CheckInViewProps) {
  const t = useTranslate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 w-full bg-darkgray rounded-t-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2.5 text-muted-foreground hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{ticket.eventName}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{ticket.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{format(new Date(ticket.date), "PPp")}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG
                value={ticket.ticketNumber}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {t("Ticket Number")}
            </div>
            <div className="mt-1 font-mono text-lg">{ticket.ticketNumber}</div>
            {ticket.seat && (
              <div className="mt-2 text-sm text-muted-foreground">
                {ticket.seat}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 