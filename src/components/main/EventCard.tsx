import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CalendarIcon, Location, PriceTag } from "../icons/MainIcons"
import { EventCardProps } from "@/type/type"
import { cn } from "@/lib/utils"
import { useTranslate } from "@refinedev/core"

const EventCard = ({
  image,
  title,
  location,
  date,
  price,
  points,
  type,
  validDate,
  onClick
} : EventCardProps) => {
  const t = useTranslate();
  return (
    <Card className={cn("border-0 p-2 relative rounded-lg overflow-hidden text-background", "min-w-[346px] h-full", {"bg-[#202020] border border-[#F1EAD61C] min-w-0": type === "small", "bg-[#202020] flex min-w-0 p-0": type === "event"})} onClick={onClick}>
      <CardContent className="p-0">
        <img src={image} className={cn("absolute top-0 left-0 object-cover", {"relative rounded-md mb-2 w-[346px]": type === "small", "relative min-w-[125px] max-w-[125px] w-full h-full object-cover": type === "event"})}/>
      </CardContent>
      <CardHeader className={cn("gap-1.5", "mt-20 backdrop-blur-[30px] p-4 bg-white/15 rounded-lg", {"mt-0 p-0 bg-transparent backdrop-blur-none": type === "small", "mt-0 bg-transparent p-3.5 backdrop-blur-none justify-between": type === "event"})}>
        <CardTitle className={cn("text-sm font-semibold", "text-background", {"text-white": type === "small", "text-white text-base": type === "event"})}>{title}</CardTitle>
        {type === "small" ? (
          <CardDescription className={cn("justify-between flex items-center text-white")}>
            <section className="flex flex-col gap-1.5">
              {location ? (
                <div className="flex items-center gap-2">
                  <Location />
                  <p className="text-xs">{location}</p>
                </div>
              ) : null}
              {date ? (
                <div className="flex items-center gap-2">
                  <CalendarIcon />
                  <p className="text-xs">{date}</p>
                </div>
              ) : null}
              {price ? (
                <div className="flex items-center gap-2 mt-1">
                  <PriceTag />
                  <p className="text-xs">{price}</p>
                </div>
              ) : null}
               {points ? (
                <div className="flex items-center gap-2 mt-1 text-mainorange font-semibold">
                  <PriceTag />
                  <p className="text-xs">{t("point", {count: points})}</p>
                </div>
              ) : null}
            </section>
          </CardDescription>
        ) : type === "event" ? (
          <CardDescription className={cn("justify-between flex items-center text-white")}>
            <section className="flex flex-col justify-between h-full">
              <div className="flex flex-col gap-1.5">
                {location ? (
                  <div className="flex items-center gap-2">
                    <Location />
                    <p className="text-xs">{location}</p>
                  </div>
                ) : null}
                {date ? (
                  <div className="flex items-center gap-2">
                    <CalendarIcon />
                    <p className="text-xs">{date}</p>
                  </div>
                ) : null}
              </div>
              {validDate ? <p className="text-xs text-[#FFFFFF99] mt-4">{t("Valid to")} {validDate}</p> : null}
            </section>
          </CardDescription>
        ) : (
          <CardDescription className={cn("justify-between flex items-center text-background")}>
            <section className="flex flex-col gap-1.5">
              {location ? (
                <div className="flex items-center gap-2">
                  <Location />
                  <p className="text-sm">{location}</p>
                </div>
              ) : null}
              {date ? (
                <div className="flex items-center gap-2">
                  <CalendarIcon />
                  <p className="text-sm">{date}</p>
                </div>
              ) : null}
            </section>

            {price ? (
              <div>
                <p className="text-sm">{t("Start from")}</p>
                <h2 className="text-lg font-semibold">{price}</h2>
              </div>
            ) : null}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}

export default EventCard