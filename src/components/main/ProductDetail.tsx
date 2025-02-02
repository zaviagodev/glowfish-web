import { motion } from "framer-motion";
import { Tag, X, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

interface ProductDetailProps {
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
  damping: 30,
  mass: 0.8,
};

export function ProductDetail({
  id,
  image,
  title,
  location,
  date,
  price,
  points,
  onClose,
}: ProductDetailProps) {
  const t = useTranslate();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose();
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[8px]"
      onClick={handleBackdropClick}
    >
      <motion.div
        layoutId={`card-${id}`}
        className="relative h-full w-full bg-background overflow-y-auto"
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
          mass: 0.8,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-4 z-[60] bg-black/20 hover:bg-black/30 text-white focus:ring-0"
          onClick={onClose}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <motion.div
          layoutId={`image-container-${id}`}
          className="relative w-full aspect-[4/3] overflow-hidden bg-black/10"
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
            mass: 0.8,
          }}
        >
          <motion.img
            layoutId={`image-${id}`}
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top"
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
              mass: 0.8,
            }}
          />
          {price && (
            <motion.div
              layoutId={`price-${id}`}
              className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium"
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
                mass: 0.8,
              }}
            >
              {price}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          layoutId={`content-${id}`}
          className="p-4 space-y-6"
          transition={springConfig}
        >
          <motion.div className="space-y-2">
            <motion.h1
              layoutId={`title-${id}`}
              className="text-2xl font-bold tracking-tight"
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
                mass: 0.8,
                layout: { duration: 0.3 },
              }}
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

            <div className="space-y-2">
              {location && (
                <motion.div
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </motion.div>
              )}
              {date && (
                <motion.div
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                </motion.div>
              )}
              {points && (
                <motion.div
                  className="flex items-center gap-2 text-sm text-primary font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Tag className="w-4 h-4" />
                  <span>{t("point", { count: points })}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h2 className="font-semibold">{t("Description")}</h2>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            <Button className="w-full bg-primary text-primary-foreground">
              {t("Book Now")}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
