import { cn } from "@/lib/utils";
import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
import { ComponentType } from "react";

interface NoItemsProps {
  text: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
  description?: string;
}

const NoItemsComp = ({
  text,
  icon: IconComponent,
  className,
  description,
}: NoItemsProps) => {
  const t = useTranslate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex flex-col items-center justify-center py-8 px-4 space-y-4",
        className
      )}
    >
      <IconComponent className="w-16 h-16 text-muted-foreground/50" />
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground font-medium">{t(text)}</p>
        {description && (
          <p className="text-sm text-muted-foreground/70">{t(description)}</p>
        )}
      </div>
    </motion.div>
  );
};

export default NoItemsComp;
