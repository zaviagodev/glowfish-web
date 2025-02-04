import { motion } from "framer-motion";
import { Calendar, MapPin, Tag } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string | number;
  image: string;
  title: string;
  location?: string;
  date?: string;
  price?: string | number;
  points?: string | number;
  type?: "small" | "event";
  validDate?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const springConfig = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 0.8,
  restDelta: 0.001,
};

export function ProductCard({
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
  isSelected,
}: ProductCardProps) {
  const t = useTranslate();

  return (
    <motion.div
      layoutId={`card-${id}`}
      onClick={onClick}
      style={{
        position: isSelected ? "fixed" : "relative",
        top: isSelected ? 0 : undefined,
        left: isSelected ? 0 : undefined,
        right: isSelected ? 0 : undefined,
        zIndex: isSelected ? 60 : undefined,
      }}
      className={cn(
        "overflow-hidden rounded-lg cursor-pointer w-full",
        "bg-card border border-border/10",
        type === "event" && "flex",
        isSelected && "h-full"
      )}
      transition={springConfig}
      initial={isSelected ? { opacity: 0, y: 20 } : false}
      animate={isSelected ? { opacity: 1, y: 0 } : undefined}
      whileHover={!isSelected ? { scale: 0.98 } : undefined}
      whileTap={!isSelected ? { scale: 0.95 } : undefined}
    >
      <motion.div
        layoutId={`image-container-${id}`}
        className={cn(
          "relative overflow-hidden",
          type === "small" ? "h-48 w-full" : "h-56 w-full",
          type === "event" && "w-[125px] min-w-[125px]",
          isSelected && "aspect-[4/3] w-full"
        )}
        transition={springConfig}
      >
        <motion.img
          layoutId={`image-${id}`}
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          transition={springConfig}
        />
      </motion.div>

      <div
        className={cn("p-5 space-y-4", type === "event" ? "flex-1" : "bg-card")}
      >
        <div className="space-y-2">
          <motion.h3
            layoutId={`title-${id}`}
            className="font-bold tracking-tight text-card-foreground line-clamp-2"
            transition={springConfig}
          >
            {title}
          </motion.h3>

          {price && (
            <motion.p
              layoutId={`price-${id}`}
              className={cn(
                "font-medium text-primary",
                isSelected ? "text-xl" : "text-sm"
              )}
              transition={springConfig}
            >
              {price}
            </motion.p>
          )}

          <div className="space-y-2">
            {location && (
              <motion.div
                layoutId={`location-${id}`}
                className={cn(
                  "flex items-center gap-2",
                  isSelected ? "text-sm" : "text-xs text-muted-foreground"
                )}
                transition={springConfig}
              >
                <MapPin className={isSelected ? "w-4 h-4" : "w-3.5 h-3.5"} />
                <span className="line-clamp-1">{location}</span>
              </motion.div>
            )}
            {date && (
              <motion.div
                layoutId={`date-${id}`}
                className={cn(
                  "flex items-center gap-2",
                  isSelected ? "text-sm" : "text-xs text-muted-foreground"
                )}
                transition={springConfig}
              >
                <Calendar className={isSelected ? "w-4 h-4" : "w-3.5 h-3.5"} />
                <span>{date}</span>
              </motion.div>
            )}
            {points && (
              <motion.div
                layoutId={`points-${id}`}
                className={cn(
                  "flex items-center gap-2 font-medium text-primary",
                  isSelected ? "text-sm" : "text-xs"
                )}
                transition={springConfig}
              >
                <Tag className={isSelected ? "w-4 h-4" : "w-3.5 h-3.5"} />
                <span>{t("point", { count: points })}</span>
              </motion.div>
            )}
          </div>
        </div>

        {validDate && !isSelected && (
          <p className="text-xs text-muted-foreground">
            {t("Valid to")} {validDate}
          </p>
        )}

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h2 className="font-semibold">{t("Description")}</h2>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
