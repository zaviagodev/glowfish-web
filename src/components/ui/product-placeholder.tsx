import { cn } from "@/lib/utils";
import { Image } from "lucide-react";

interface ProductPlaceholderProps {
  className?: string;
  imageClassName?: string;
}

const ProductPlaceholder = ({
  className,
  imageClassName = "w-20 h-20",
}: ProductPlaceholderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-full w-full bg-[#E3E3E3] dark:bg-[#303030]",
        className
      )}
    >
      <Image
        className={cn(imageClassName, "text-[#CDCDCD] dark:text-[#767676]")}
      />
    </div>
  );
};

export default ProductPlaceholder;
