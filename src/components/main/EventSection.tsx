import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EventCard from "@/components/main/EventCard";
import { cn } from "@/lib/utils";
import { EventDataProps } from "@/type/type";
import { useTranslate } from "@refinedev/core";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
            className="text-muted-foreground hover:text-foreground text-xs transition-colors no-underline"
          >
            {t("See all")}
          </Link>
        )}
      </div>

      <Carousel>
        <CarouselContent className="px-5">
          {list.map((item, index) => (
            <CarouselItem
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default EventSection;
