import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar, Location, PriceTag } from "../icons/MainIcons"
import { EventCardProps } from "@/type/type"
import { cn } from "@/lib/utils"

const EventCard = ({
  image,
  title,
  location,
  date,
  price,
  type,
  onClick
} : EventCardProps) => {
  return (
    <Card className={cn("border-0 p-2 relative rounded-lg overflow-hidden text-background", "min-w-[346px] h-full", {"bg-[#202020] border border-[#F1EAD61C] min-w-0": type === "small"})} onClick={onClick}>
      <CardContent className="p-0">
        <img src={image} className={cn("absolute top-0 left-0 object-cover", {"relative rounded-md mb-2": type === "small"})}/>
      </CardContent>
      <CardHeader className={cn("gap-1.5", "mt-20 backdrop-blur-[30px] p-4 bg-white/15 rounded-lg", {"mt-0 p-0 bg-transparent": type === "small"})}>
        <CardTitle className={cn("text-sm font-semibold", "text-background", {"text-white": type === "small"})}>{title}</CardTitle>
        {type === "small" ? (
          <CardDescription className={cn("justify-between flex items-center text-white")}>
            <section className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Location />
                <p className="text-xs">{location}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar />
                <p className="text-xs">{date}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <PriceTag />
                <p className="text-xs">{price}</p>
              </div>
            </section>
          </CardDescription>
        ) : (
          <CardDescription className={cn("justify-between flex items-center text-background")}>
            <section className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Location />
                <p className="text-sm">{location}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar />
                <p className="text-sm">{date}</p>
              </div>
            </section>

            <div>
              <p className="text-sm">Start from</p>
              <h2 className="text-lg font-semibold">{price}</h2>
            </div>
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}

export default EventCard