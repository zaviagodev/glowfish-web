import { Skeleton, SVGSkeleton } from "../ui/skeleton";

const TicketsSkeletons = () => (
  <div className="pt-14 pb-4">
    <div>
      <div className="px-4">
        <div className="items-center justify-center w-full h-auto p-1 grid grid-cols-2 gap-1">
          <div className="inline-flex items-center justify-center px-3 py-2.5">
            <Skeleton className="w-20 max-w-full" />
          </div>
          <div className="inline-flex items-center justify-center px-3 py-2.5">
            <Skeleton className="w-20 max-w-full" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="px-5 space-y-4">
          <div className="relative shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative grid grid-cols-3">
              <SVGSkeleton className="object-cover aspect-square object-top w-full h-full" />
              <div className="p-4 col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="mb-2">
                    <Skeleton className="w-[80px] max-w-full" />
                  </h3>
                  <div className="mb-2">
                    <div className="inline-flex px-2 py-1 gap-1">
                      <Skeleton className="w-[56px] max-w-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="lucide-map-pin flex-shrink-0 w-[24px] h-[24px]" />
                    <span className="line-clamp-1">
                      <Skeleton className="w-[56px] max-w-full" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                    <span>
                      <Skeleton className="w-[136px] max-w-full" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                    <span>
                      <Skeleton className="w-[64px] max-w-full" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative grid grid-cols-3">
              <SVGSkeleton className="object-cover aspect-square object-top w-full h-full" />
              <div className="p-4 col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="mb-2">
                    <Skeleton className="w-[80px] max-w-full" />
                  </h3>
                  <div className="mb-2">
                    <div className="inline-flex px-2 py-1 gap-1">
                      <Skeleton className="w-[56px] max-w-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="lucide-map-pin flex-shrink-0 w-[24px] h-[24px]" />
                    <span className="line-clamp-1">
                      <Skeleton className="w-[56px] max-w-full" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                    <span>
                      <Skeleton className="w-[136px] max-w-full" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                    <span>
                      <Skeleton className="w-[64px] max-w-full" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative grid grid-cols-3">
              <SVGSkeleton className="object-cover aspect-square object-top w-full h-full" />
              <div className="p-4 col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="mb-2">
                    <Skeleton className="w-[80px] max-w-full" />
                  </h3>
                  <div className="mb-2">
                    <div className="inline-flex px-2 py-1 gap-1">
                      <Skeleton className="w-[56px] max-w-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="lucide-map-pin flex-shrink-0 w-[24px] h-[24px]" />
                    <span className="line-clamp-1">
                      <Skeleton className="w-[56px] max-w-full" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                    <span>
                      <Skeleton className="w-[136px] max-w-full" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SVGSkeleton className="flex-shrink-0 w-[24px] h-[24px]" />
                    <span>
                      <Skeleton className="w-[64px] max-w-full" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TicketsSkeletons;
