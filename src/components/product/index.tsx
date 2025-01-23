import { motion, useMotionTemplate, useMotionValue, useTransform, animate } from "framer-motion";
import { X } from "lucide-react";
import { CalendarIcon, Location, PriceTag } from "@/components/icons/MainIcons";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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

const SPRING_CONFIG = {
  type: "spring",
  damping: 30,
  stiffness: 300,
  mass: 0.2
};

const ProductPage = ({
  id,
  image,
  title,
  price,
  location,
  date,
  points,
  onClose
}: ProductPageProps) => {
  const t = useTranslate();
  const progress = useMotionValue(0);
  const scale = useTransform(progress, [0, 1], [0.8, 1]);
  const opacity = useTransform(progress, [0, 1], [0, 1]);
  const y = useTransform(progress, [0, 1], [100, 0]);
  const backdropFilter = useMotionTemplate`blur(${useTransform(progress, [0, 1], [0, 8])}px)`;

  useEffect(() => {
    const animation = animate(progress, 1, {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1]
    });
    return () => animation.stop();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ 
        backgroundColor: useMotionTemplate`rgba(0, 0, 0, ${useTransform(progress, [0, 1], [0, 0.4])})`,
        backdropFilter
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ scale, opacity, y }}
        transition={SPRING_CONFIG}
      >
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-4 z-[60] bg-black/10 hover:bg-black/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="h-full w-full bg-background overflow-y-auto">
          <motion.div 
            className="relative w-full aspect-[4/3] overflow-hidden"
            layoutId={`image-container-${id}`}
            transition={SPRING_CONFIG}
          >
            <motion.img
              layoutId={`image-${id}`}
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              transition={SPRING_CONFIG}
            />
          </motion.div>

          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <motion.h1
                layoutId={`title-${id}`}
                className="text-2xl font-bold"
                transition={SPRING_CONFIG}
              >
                {title}
              </motion.h1>
              {price && (
                <motion.p 
                  layoutId={`price-${id}`}
                  className="text-xl font-semibold text-primary"
                  transition={SPRING_CONFIG}
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
                  transition={SPRING_CONFIG}
                >
                  <Location className="w-4 h-4" />
                  <span>{location}</span>
                </motion.div>
              )}
              {date && (
                <motion.div 
                  layoutId={`date-${id}`}
                  className="flex items-center gap-2 text-sm"
                  transition={SPRING_CONFIG}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{date}</span>
                </motion.div>
              )}
              {points && (
                <motion.div 
                  layoutId={`points-${id}`}
                  className="flex items-center gap-2 text-sm text-primary font-medium"
                  transition={SPRING_CONFIG}
                >
                  <PriceTag className="w-4 h-4" />
                  <span>{t("point", {count: points})}</span>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.2,
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h2 className="font-semibold">{t("Description")}</h2>
                <p className="text-sm text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              <Button className="w-full bg-primary text-primary-foreground">
                {t("Book Now")}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductPage;