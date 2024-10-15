import EventCard from "@/components/main/EventCard"
import { cn } from "@/lib/utils"
import { EventDataProps } from "@/type/type"
import { useTranslate } from "@refinedev/core"
import { Link, useNavigate } from "react-router-dom"

interface EventSectionProps {
  list: EventDataProps[],
  title?: string
  cardType?: string
  seeAllLink?: string
}

const EventSection = ({ 
  list,
  title,
  cardType,
  seeAllLink,
} : EventSectionProps) => {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-4 mt-[30px]">
    <div className="flex items-center justify-between px-5">
      <h3 className="page-title">{title}</h3>
      <Link to={seeAllLink || ""} className="text-fadewhite decoration-none text-xs">{t("See all")}</Link>
    </div>
    <div className={cn("flex gap-3 overflow-auto px-5 w-full")}>
      {list.map((event: any) => (
        <EventCard 
          key={event.id}
          image={event.image} 
          title={event.title} 
          location={event.location}
          date={event.date}
          price={event.price}
          type={cardType}
          onClick={() => navigate(`/home/show/${event.id}`)}
        />
      ))}
    </div>
  </section>
  )
}

export default EventSection