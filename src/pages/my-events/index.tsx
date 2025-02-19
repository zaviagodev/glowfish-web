import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import Header from "@/components/main/Header";
import EventCard from "@/components/main/EventCard";
import { useEvents } from "@/features/home/hooks/useEvents";
import LoadingSpin from "@/components/loading/LoadingSpin";

const MyEventsPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { events, loading, error } = useEvents();

  if (loading) {
    return (
      <>
        <Header title={t("My Events")} />
        <LoadingSpin />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title={t("My Events")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t("My Events")} />
      <section className="flex flex-col gap-y-10">
        <h2 className="page-title">{t("Booked Events")}</h2>
        {events.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>{t("No events found")}</p>
          </div>
        ) : (
          <section className="flex flex-col gap-y-5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                type="event"
                title={`${event.product_name} - ${event.variant_name}`}
                location={event.location}
                date={event.date}
                image={event.image}
                onClick={() => navigate(`/my-events/detail/${event.id}`)}
              />
            ))}
          </section>
        )}
      </section>
    </>
  );
};

export default MyEventsPage;
