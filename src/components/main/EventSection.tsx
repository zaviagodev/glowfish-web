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
  eventCardLink?: string
}

const EventSection = ({ 
  list,
  title,
  cardType,
  seeAllLink,
  eventCardLink
} : EventSectionProps) => {
  const t = useTranslate();
  const navigate = useNavigate();

  // Debug output

  return (
    <section className="flex flex-col gap-4 mt-[30px]">
      <div className="flex items-center justify-between px-5">
        <h3 className="page-title">{title}</h3>
        {seeAllLink && (
          <Link to={seeAllLink} className="text-fadewhite decoration-none text-xs">
            {t("See all")}
          </Link>
        )}
      </div>
      <div className={cn("flex gap-3 overflow-auto px-5 w-full")}>
        {list.map((item: any) => {
          console.log(item);
          return (
            <EventCard 
              key={item.id}
              {...item}
              type={cardType}
              onClick={() => navigate(`${eventCardLink || '/home/show/'}${item.id}`)}
            />
          );
        })}
      </div>
    </section>
  )
}

export default EventSection