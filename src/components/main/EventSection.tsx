import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EventDataProps } from "@/type/type";
import { useTranslate } from "@refinedev/core";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedCard } from "../shared/AnimatedCard";
import { ProductDetail } from "../product/ProductDetail";

interface EventSectionProps {
  list: EventDataProps[];
  title?: string;
  seeAllLink?: string;
}

const EventSection = ({ list, title, seeAllLink }: EventSectionProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

      <div
        className={cn(
          "flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5",
          "scroll-smooth"
        )}
      >
        {list.map((item) => (
          <motion.div
            key={item.title}
            className="flex-shrink-0 w-[280px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() =>
              // navigate(`${eventCardLink || "/home/show/"}${item.id}`)
              setSelectedEvent(item)
            }
          >
            <AnimatedCard
              id={item.id}
              image={item.image}
              title={item.title}
              price={item.price}
              compareAtPrice={item.compare_at_price}
              description={item.description}
              location={item.location}
              product_variants={item.product_variants}
              date={
                item.start_datetime &&
                item.end_datetime &&
                `${format(
                  new Date(item.start_datetime),
                  "dd-MM-yyyy HH:mm"
                )} - ${format(new Date(item.end_datetime), "dd-MM-yyyy HH:mm")}`
              }
            />
          </motion.div>
        ))}
      </div>

      {selectedEvent && (
        <ProductDetail
          {...selectedEvent}
          onClose={(e: any) => {
            e.stopPropagation();
            setSelectedEvent(null);
          }}
        />
      )}
    </section>
  );
};

export default EventSection;
