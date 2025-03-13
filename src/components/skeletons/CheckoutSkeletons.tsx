import { Skeleton, SVGSkeleton } from "../ui/skeleton";

const CheckoutSkeletons = () => (
  <div className="p-5 space-y-6">
    <div className="shadow-sm">
      <div className="pb-0">
        <h2 className="mb-3">
          <Skeleton className="w-[128px] max-w-full" />
        </h2>
        <div>
          <Skeleton className="w-[56px] max-w-full" />
        </div>
      </div>
      <div>
        <div className="py-4 flex gap-3">
          <div className="w-16 h-16 flex-shrink-0">
            <SVGSkeleton className="object-cover object-top w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="line-clamp-2">
              <Skeleton className="w-[80px] max-w-full" />
            </h4>
            <div className="flex items-center justify-between mt-2">
              <p>
                <Skeleton className="w-[32px] max-w-full" />
              </p>
              <p>
                <Skeleton className="w-[16px] max-w-full" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p>
          <Skeleton className="w-[240px] max-w-full" />
        </p>
        <p>
          <Skeleton className="w-[320px] max-w-full" />
        </p>
      </div>
      <div className="h-4 w-6">
        <SVGSkeleton className="w-6 h-6" />
      </div>
    </div>
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="space-y-2">
          <Skeleton className="w-[120px] max-w-full" />
          <Skeleton className="w-6 max-w-full" />
        </h2>
        <SVGSkeleton className="lucide-chevron-right w-6 h-6" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <SVGSkeleton className="w-10 h-10" />
        </div>
        <div>
          <div>
            <Skeleton className="w-[112px] max-w-full" />
          </div>
          <div className="mt-0.5">
            <Skeleton className="w-[184px] max-w-full" />
          </div>
        </div>
      </div>
    </div>
    <div>
      <div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>
              <Skeleton className="w-[64px] max-w-full" />
            </span>
            <span>
              <Skeleton className="w-[32px] max-w-full" />
            </span>
          </div>
          <div className="pt-3 mt-1 border-t flex justify-between">
            <span>
              <Skeleton className="w-[40px] max-w-full" />
            </span>
            <span>
              <Skeleton className="w-[32px] max-w-full" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span>
          <Skeleton className="w-[104px] max-w-full" />
        </span>
        <span>
          <Skeleton className="w-[32px] max-w-full" />
        </span>
      </div>
      <div className="inline-flex items-center justify-center transition-colors py-2 w-full h-12">
        <Skeleton className="w-full max-w-full" />
      </div>
    </div>
  </div>
);

export default CheckoutSkeletons;
