import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, MapPin, Tag } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

interface AnimatedDetailProps {
  id: string | number;
  image: string;
  title: string;
  location?: string;
  date?: string;
  price?: string | number;
  points?: string | number;
  onClose: () => void;
}

const springConfig = {
  type: "spring",
  stiffness: 350,
  damping: 25,
  mass: 0.5,
};

export function AnimatedDetail({
  id,
  image,
  title,
  location,
  date,
  price,
  points,
  onClose,
}: AnimatedDetailProps) {
  const t = useTranslate();

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[8px]"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          layoutId={`card-${id}`}
          className="relative h-full w-full bg-background overflow-y-auto"
          transition={springConfig}
        >
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-4 top-4 z-[60] bg-black/20 hover:bg-black/30 text-white"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          <motion.div
            layoutId={`image-container-${id}`}
            className="relative w-full aspect-[4/3] overflow-hidden"
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

          <div className="p-5 space-y-6">
            <div className="space-y-2">
              <motion.h1
                layoutId={`title-${id}`}
                className="text-2xl font-bold"
                transition={springConfig}
              >
                {title}
              </motion.h1>
              {price && (
                <motion.p
                  layoutId={`price-${id}`}
                  className="text-xl font-semibold text-primary"
                  transition={springConfig}
                >
                  {price}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              {location && (
                <motion.div
                  layoutId={`location-${id}`}
                  className="flex items-center gap-2 text-sm"
                  transition={springConfig}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </motion.div>
              )}
              {date && (
                <motion.div
                  layoutId={`date-${id}`}
                  className="flex items-center gap-2 text-sm"
                  transition={springConfig}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                </motion.div>
              )}
              {points && (
                <motion.div
                  layoutId={`points-${id}`}
                  className="flex items-center gap-2 text-sm text-primary font-medium"
                  transition={springConfig}
                >
                  <Tag className="w-4 h-4" />
                  <span>{t("point", { count: points })}</span>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h2 className="font-semibold">{t("Description")}</h2>
                <p className="text-sm text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              <Button className="w-full bg-primary text-primary-foreground">
                {t("Book Now")}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
