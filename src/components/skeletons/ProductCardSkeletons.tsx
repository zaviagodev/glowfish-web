import { Skeleton, SVGSkeleton } from "../ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2>
        <Skeleton className="w-[120px] max-w-full bg-darkgray rounded-lg" />
      </h2>
      <a>
        <Skeleton className="w-[56px] max-w-full bg-darkgray rounded-lg" />
      </a>
    </div>
    <div className="flex-shrink-0 w-[200px]">
      <div className="relative w-full h-full rounded-xl">
        <div className="relative max-h-[360px] h-[60vw] w-full">
          <SVGSkeleton className="object-cover object-top w-full h-full" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
