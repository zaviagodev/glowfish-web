import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedImageProps {
  src: string;
  alt: string;
  layoutId: string;
  className?: string;
  onClick?: () => void;
}

export function AnimatedImage({
  src,
  alt,
  layoutId,
  className,
  onClick,
}: AnimatedImageProps) {
  return (
    <motion.div
      layoutId={`image-container-${layoutId}`}
      className={cn("relative overflow-hidden", className)}
      onClick={onClick}
    >
      <motion.img
        layoutId={`image-${layoutId}`}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      <motion.div
        layoutId={`gradient-${layoutId}`}
        className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent"
      />
    </motion.div>
  );
}
