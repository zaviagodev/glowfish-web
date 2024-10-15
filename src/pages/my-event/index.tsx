import EventCard from "@/components/main/EventCard"
import Header from "@/components/main/Header"
import { event_data } from "@/data/data"
import { useTranslate } from "@refinedev/core"
import { useNavigate } from "react-router-dom"

const MyEvent = () => {

  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <>
      <Header title="My Event" />
      <section className="flex flex-col gap-y-10">
        <h2 className="page-title">{t("Booked Event")}</h2>
        <section className="flex flex-col gap-y-5">
          {event_data.map(ev => (
          <EventCard 
            type="event"
            title={ev.title}
            location={ev.location}
            date={ev.date}
            image={ev.image}
            validDate={ev.validDate}
            onClick={() => navigate(`/my-event/${ev.id}`)}
          />
          ))}
        </section>
      </section>
    </>
  )
}

export default MyEvent