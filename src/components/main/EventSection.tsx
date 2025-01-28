import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EventCard from "@/components/main/EventCard";
import { cn } from "@/lib/utils";
import { EventDataProps } from "@/type/type";
import { useTranslate } from "@refinedev/core";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventSectionProps {
  list: EventDataProps[];
  title?: string;
  cardType?: string;
  seeAllLink?: string;
  eventCardLink?: string;
  isFullWidth?: boolean;
}

const EventSection = ({
  list,
  title,
  cardType,
  seeAllLink,
  eventCardLink,
  isFullWidth,
}: EventSectionProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <section className="flex flex-col gap-4 mt-[30px]">
      <div className="flex items-center justify-between px-5">
        <h3 className="page-title">{title}</h3>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            {t("See all")}
          </Link>
        )}
      </div>

      <div className="relative group">
        {/* <AnimatePresence>
          {!isFullWidth && list.length > 2 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </AnimatePresence> */}

        <div
          ref={scrollContainerRef}
          className={cn(
            "grid grid-cols-2 gap-4 px-5",
            isFullWidth
              ? "flex-col"
              : "overflow-x-auto scrollbar-hide scroll-smooth",
            !isFullWidth && "pb-4"
          )}
        >
          {list.map((item, index) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex-shrink-0 w-full"
                // isFullWidth ? "w-full" : "w-[280px]"
              )}
            >
              <EventCard
                id={item.id}
                {...item}
                type={cardType}
                onClick={() =>
                  navigate(`${eventCardLink || "/home/show/"}${item.id}`)
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventSection;
