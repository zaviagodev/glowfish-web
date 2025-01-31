import { motion, AnimatePresence, useSpring } from "framer-motion";
import { Calendar, X, MapPin, Tag } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

export interface ProductPageProps {
  id: number | string;
  image: string;
  title: string;
  price?: string | number;
  location?: string;
  date?: string;
  points?: string | number;
  onClose: () => void;
}

// iOS-like spring configuration
const springConfig = {
  type: "spring",
  mass: 1,
  stiffness: 300,
  damping: 30,
  restDelta: 0.001,
};

export const ProductPage = ({
  id,
  image,
  title,
  price,
  location,
  date,
  points,
  onClose,
}: ProductPageProps) => {
  const t = useTranslate();
  const opacity = useSpring(0, {
    stiffness: 300,
    damping: 30,
  });

  return createPortal(
    <AnimatePresence mode="sync">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
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
              className="w-full h-full object-cover object-top"
              transition={springConfig}
            />
          </motion.div>

          <div className="p-4 space-y-6">
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.3,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <Button className="w-full bg-primary text-primary-foreground">
                  {t("Book Now")}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
