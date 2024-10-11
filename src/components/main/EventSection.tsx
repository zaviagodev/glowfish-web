import EventCard from "@/components/main/EventCard"
import { cn } from "@/lib/utils"
import { EventDataProps } from "@/type/type"
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

  const navigate = useNavigate()

  return (
    <section className="flex flex-col gap-4 mt-[30px]">
    <div className="flex items-center justify-between px-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Link to={seeAllLink || ""} className="text-fadewhite decoration-none text-xs">See all</Link>
    </div>

    <div className={cn("flex gap-3 overflow-auto px-5 w-full")}>
      {list.map((l: any) => (
      <EventCard 
        key={l.id}
        image={l.image} 
        title={l.title} 
        location={l.location}
        date={l.date}
        price={l.price}
        type={cardType}
        onClick={() => navigate(`/home/show/${l.id}`)}
      />
      ))}
    </div>
  </section>
  )
}

export default EventSection