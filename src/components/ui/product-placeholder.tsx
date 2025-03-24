import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import GlowfishIcon from "../icons/GlowfishIcon";

interface ProductPlaceholderProps {
  className?: string;
  imageClassName?: string;
}

const ProductPlaceholder = ({
  className,
  imageClassName,
}: ProductPlaceholderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-full w-full bg-black",
        className
      )}
    >
      <GlowfishIcon className={imageClassName} />
    </div>
  );
};

export default ProductPlaceholder;
