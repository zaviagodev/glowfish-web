import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { EventCardProps } from "@/type/type";
import { Calendar, MapPin, Tag } from "lucide-react";

const EventCard = ({
  id,
  image,
  title,
  location,
  date,
  price,
  points,
  type,
  validDate,
  onClick,
}: EventCardProps) => {
  const t = useTranslate();

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer w-full h-full",
        "bg-card border border-border/10",
        "transition-all duration-200 hover:scale-[0.98] active:scale-[0.97]",
        type === "event" && "flex"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          type === "small" ? "h-40 w-full" : "h-32 w-full",
          type === "event" && "w-[125px] min-w-[125px]"
        )}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
        {price && (
          <div className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {price}
          </div>
        )}
      </div>

      <div
        className={cn("p-4 space-y-4", type === "event" ? "flex-1" : "bg-card")}
      >
        <div className="space-y-2">
          <h3 className="font-semibold text-card-foreground line-clamp-2">
            {title}
          </h3>

          <div className="space-y-2">
            {location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{date}</span>
              </div>
            )}
            {points && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>{t("point", { count: points })}</span>
              </div>
            )}
          </div>
        </div>

        {validDate && (
          <p className="text-xs text-muted-foreground">
            {t("Valid to")} {validDate}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCard;
