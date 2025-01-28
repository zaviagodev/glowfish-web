import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface BannerProps {
  banners: string[];
  currentBanner: number;
}

export const Banner = memo(function Banner({ banners, currentBanner }: BannerProps) {
  return (
    <div className="relative aspect-[2/1] bg-muted overflow-hidden">
      <motion.div
        animate={{ x: `-${currentBanner * 100}%` }}
        transition={{ duration: 0.5 }}
        className="flex"
      >
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            alt={`Banner ${index + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </motion.div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {banners.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              currentBanner === index ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
});