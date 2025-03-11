import { AnimatePresence, motion } from "framer-motion";
import { format, isPast } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { EventDataProps } from "@/type/type 2";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AnimatedCard } from "../shared/AnimatedCard";
import { formattedDateAndTime } from "@/lib/utils";

interface EventSectionProps {
  list: EventDataProps[];
  title?: string;
  seeAllLink?: string;
}

const EventSection = ({ list, title, seeAllLink }: EventSectionProps) => {
  const t = useTranslate();

  return (
    <section className="flex flex-col gap-4 mt-[30px] px-5">
      <div className="flex items-center justify-between">
        <h3 className="page-title">{title}</h3>
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
        {list
          .filter((item) => isPast(item.end_datetime as string) === false)
          .map((item) => {
            const formattedTime =
              item.start_datetime &&
              item.end_datetime &&
              `${format(
                toZonedTime(new Date(item.start_datetime), "UTC"),
                formattedDateAndTime
              )} - ${format(
                toZonedTime(new Date(item.end_datetime), "UTC"),
                formattedDateAndTime
              )}`;
            return (
              <motion.div
                key={item.title}
                className="flex-shrink-0 w-[360px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  price={item.price}
                  compareAtPrice={item.compare_at_price}
                  location={item.location}
                  product_variants={item.product_variants}
                  date={formattedTime}
                  end_datetime={item.end_datetime}
                />
              </motion.div>
            );
          })}
      </div>
    </section>
  );
};

export default EventSection;
