import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { EventCardProps } from "@/type/type 2";
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
        "relative overflow-hidden rounded-lg cursor-pointer w-full h-fit",
        "border border-border/10",
        "transition-all duration-200 hover:scale-[0.98] active:scale-[0.97]",
        type === "event" && "flex"
      )}
    >
      <div className={cn("relative overflow-hidden h-[220px] w-full")}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-lg object-top"
        />
        <div className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-orangefocus text-white text-xs font-medium">
          {price && price !== 0 ? `฿${price}` : t("Free")}
        </div>
      </div>

      <div
        className={cn(
          "p-2 space-y-4 flex-1 text-white absolute bottom-0 w-full"
        )}
      >
        <div className="space-y-2 backdrop-blur-sm rounded-lg bg-background/50 p-4">
          <h3 className="font-semibold line-clamp-2 text-sm">{title}</h3>
          {location && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          )}
          {points ? (
            <div className="flex items-center gap-2 text-xs">
              <Tag className="w-3.5 h-3.5" />
              <span>{t("point", { count: points })}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Tag className="w-3.5 h-3.5" />
              <span>{t("Free")}</span>
            </div>
          )}
          {/* {validDate && (
            <p className="text-xs">
              {t("Valid to")} {validDate}
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
