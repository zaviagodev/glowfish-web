import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QrCode, Barcode, Hash, Calendar, MapPin, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formattedDateAndTime } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";
import Barcode1D from "react-barcode";
import { format } from "date-fns";

interface CheckInViewProps {
  ticket: {
    id: string;
    eventName: string;
    ticketNumber: string;
    seat: string;
    date: string;
    location: string;
  };
  onClose: () => void;
}

export function CheckInView({ ticket, onClose }: CheckInViewProps) {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState("qr");
  const [showTestView, setShowTestView] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[20px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pb-3 pt-8 text-left border-b before:w-12 before:h-1 before:bg-white/20 before:rounded-full before:mx-auto before:absolute before:left-[50%] before:translate-x-[-50%] before:top-4">
          <div className="absolute left-1/2 -top-3 w-12 h-1 bg-[#E5E5EA] rounded-full transform -translate-x-1/2" />
          <h2 className="text-lg font-semibold">{t("Check In")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("Show this code to check in")}
          </p>

          <div>
            <button
              className="bg-white/[12%] p-1 absolute right-5 top-6 rounded-full opacity-70"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
            {/* <button
              className="absolute right-5 top-[60%] text-sm text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowTestView(true);
              }}
            >
              {t("Test")}
            </button> */}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-center p-0 bg-transparent border-b h-12">
            <TabsTrigger
              value="qr"
              className={cn(
                "flex-1 h-full data-[state=active]:bg-transparent",
                "border-b-2 rounded-none transition-colors",
                "data-[state=active]:border-primary data-[state=active]:text-primary",
                "data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground"
              )}
            >
              <QrCode className="w-4 h-4 mr-2" />
              {t("QR Code")}
            </TabsTrigger>
            <TabsTrigger
              value="barcode"
              className={cn(
                "flex-1 h-full data-[state=active]:bg-transparent",
                "border-b-2 rounded-none transition-colors",
                "data-[state=active]:border-primary data-[state=active]:text-primary",
                "data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground"
              )}
            >
              <Barcode className="w-4 h-4 mr-2" />
              {t("Barcode")}
            </TabsTrigger>
            <TabsTrigger
              value="number"
              className={cn(
                "flex-1 h-full data-[state=active]:bg-transparent",
                "border-b-2 rounded-none transition-colors",
                "data-[state=active]:border-primary data-[state=active]:text-primary",
                "data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground"
              )}
            >
              <Hash className="w-4 h-4 mr-2" />
              {t("Number")}
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "qr" && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-64 h-64 bg-background rounded-2xl p-4 shadow-sm flex items-center justify-center mb-4">
                    <QRCodeCanvas
                      value={`${
                        import.meta.env.VITE_ADMIN_URL
                      }/dashboard/events/record-attendance?ticket_code=${
                        ticket.ticketNumber
                      }`}
                      size={224}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("Scan to check in")}
                  </p>
                </motion.div>
              )}

              {activeTab === "barcode" && (
                <motion.div
                  key="barcode"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-full h-32 bg-background rounded-2xl p-4 shadow-sm flex items-center justify-center mb-4">
                    <Barcode1D
                      value={ticket.ticketNumber}
                      width={2}
                      height={80}
                      displayValue={false}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("Scan barcode to check in")}
                  </p>
                </motion.div>
              )}

              {activeTab === "number" && (
                <motion.div
                  key="number"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-full bg-background rounded-2xl p-6 shadow-sm mb-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">
                        {t("Ticket Number")}
                      </div>
                      <div className="text-2xl font-mono font-bold tracking-wider">
                        {ticket.ticketNumber}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("Show this number to staff")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>

        {/* Event Details */}
        <div className="px-6 pb-6">
          <div className="bg-darkgray rounded-lg p-4">
            <h3 className="font-medium mb-3">{ticket.eventName}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{ticket.location || t("To be determined")}</span>
              </div>
              {ticket.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(ticket.date), formattedDateAndTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
