import { AnimatePresence, motion } from "framer-motion";
import { format, isPast } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { EventDataProps } from "@/type/type 2";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AnimatedCard } from "../shared/AnimatedCard";
import { formattedDateAndTime } from "@/lib/utils";
import { StickyNote } from "lucide-react";
import NoItemsComp from "../ui/no-items";

interface EventSectionProps {
  list: EventDataProps[];
  title?: string;
  seeAllLink?: string;
}

const formattedTime = (event: EventDataProps) => {
  if (!event.start_datetime || !event.end_datetime) return "";
  return `${format(
    toZonedTime(new Date(event.start_datetime), "UTC"),
    formattedDateAndTime
  )} - ${format(
    toZonedTime(new Date(event.end_datetime), "UTC"),
    formattedDateAndTime
  )}`;
};

const EventSection = ({ list, title, seeAllLink }: EventSectionProps) => {
  const t = useTranslate();

  return (
    <section className="flex flex-col gap-4 mt-[30px] px-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors no-underline"
          >
            {t("See all")}
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5 scroll-smooth">
        {list.length > 0 ? (
          <>
            {list
              .filter((item) => isPast(toZonedTime(new Date(item.end_datetime as string), "UTC")) === false)
              .map((item) => {
                return (
                  <motion.div
                    key={item.title}
                    className="flex-shrink-0 w-[360px]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatedCard
                      id={item.id || ""}
                      image={item.image}
                      title={item.title}
                      price={item.price}
                      compareAtPrice={item.compare_at_price}
                      location={item.location}
                      date={formattedTime(item)}
                      end_datetime={item.end_datetime}
                    />
                  </motion.div>
                );
              })}
          </>
        ) : (
          <NoItemsComp
            icon={StickyNote}
            text="Wait and get ready for fun"
            className="w-full"
          />
        )}
      </div>
    </section>
  );
};

export default EventSection;
