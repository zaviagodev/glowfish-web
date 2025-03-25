import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import DefaultStorefront from "../icons/DefaultStorefront";
import useConfig from "@/hooks/useConfig";

interface ProductPlaceholderProps {
  className?: string;
  imageClassName?: string;
}

const ProductPlaceholder = ({
  className,
  imageClassName,
}: ProductPlaceholderProps) => {
  const { config } = useConfig();
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-black w-full h-full",
        className
      )}
    >
      {config?.storeLogo ? (
        <img
          src={config.storeLogo}
          alt="Store Logo"
          className={cn("object-contain max-w-[120px]", imageClassName)}
        />
      ) : (
        <DefaultStorefront />
      )}
    </div>
  );
};

export default ProductPlaceholder;
