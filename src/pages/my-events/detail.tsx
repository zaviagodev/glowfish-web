import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import Header from "@/components/main/Header";
import { useEvents } from "@/hooks/useEvents";
import Barcode from "react-barcode";
import LoadingSpin from "@/components/loading/LoadingSpin";

const MyEventDetail = () => {
  const { id } = useParams();
  const t = useTranslate();
  const [isQRCode, setIsQRCode] = useState(false);
  const { events, loading, error } = useEvents();
  const event = events.find((e) => e.id === id);

  if (loading) {
    return (
      <>
        <Header title={t("Event Details")} />
        <LoadingSpin />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-red-500">{error || t("Event not found")}</p>
        </div>
      </>
    );
  }

  const BookedDataComp = ({
    title,
    value,
  }: {
    title: string;
    value: string;
  }) => (
    <div className="space-y-1">
      <h3 className="text-[#5F5A5A] text-xs font-medium">{title}</h3>
      <p className="text-black page-title">{value}</p>
    </div>
  );

  return (
    <>
      <Header
        backButtonClassName="bg-white text-black rounded-sm h-8 w-8 flex items-center justify-center"
        title={t("My Event")}
      />
      <section className="bg-white rounded-xl p-5 relative">
        {!isQRCode && <img src={event.image} className="rounded-sm" />}
        <div className="border-b border-b-[#675E5E0D] space-y-2 pt-4 pb-5">
          <h3 className="text-black font-semibold text-lg leading-5">
            {event.product_name}
          </h3>
          <p className="text-[#5F5A5A] text-xs">{event.date}</p>
        </div>

        <div className="grid grid-cols-2 pt-5 gap-6">
          <BookedDataComp title={t("Order ID")} value={event.id} />
          <BookedDataComp title={t("Status")} value={event.status} />
          <BookedDataComp title={t("Date")} value={event.date} />

          {event.variant_options &&
            event.variant_options.length > 0 &&
            event.variant_options.map((option, index) => (
              <BookedDataComp
                key={index}
                title={option.name}
                value={option.value}
              />
            ))}
        </div>

        <div className="relative h-full -bottom-5">
          <div className="bg-background h-9 w-9 absolute -left-10 rounded-full" />
          {!isQRCode && (
            <div className="border border-dashed border-[#675E5E80] relative top-[18px]" />
          )}
          <div className="bg-background h-9 w-9 absolute -right-10 rounded-full" />
        </div>

        <div className="flex flex-col items-center relative pt-16">
          {/* TODO: add ScanQRCode and replace with the text QR Code Prototype */}
          {isQRCode ? "QR Code Prototype" : <Barcode value={event.id} />}
          <p
            className="text-black text-xs cursor-pointer"
            onClick={() => setIsQRCode(!isQRCode)}
          >
            {isQRCode ? t("Switch to Barcode") : t("Switch to QR Code")}
          </p>
        </div>
      </section>
    </>
  );
};

export default MyEventDetail;
