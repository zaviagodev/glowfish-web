import { Skeleton, SVGSkeleton } from "../ui/skeleton";

const MyPointsSkeleton = () => (
  <div className="pt-14 pb-16">
    <div className="relative">
      <div className="relative px-5 py-4">
        <div className="p-4 bg-darkgray rounded-lg animate-pulse">
          <div className="flex items-center gap-4">
            <div>
              <h2>
                <Skeleton className="w-[48px] max-w-full" />
              </h2>
              <p>
                <Skeleton className="w-[128px] max-w-full" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-8">
      <div className="px-5 mb-4">
        <h3 className="tracking-wide">
          <Skeleton className="w-[72px] max-w-full bg-darkgray rounded-lg animate-pulse" />
        </h3>
      </div>
      <section className="px-5">
        <div>
          <div className="mt-2">
            <div className="mt-4">
              <div className="py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-12 h-12 flex items-center justify-center bg-darkgray rounded-lg">
                      <SVGSkeleton className="lucide-arrow-down-to-line w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <p>
                        <Skeleton className="w-40 max-w-full bg-darkgray rounded-lg animate-pulse" />
                      </p>
                      <p>
                        <Skeleton className="w-24 max-w-full bg-darkgray rounded-lg animate-pulse" />
                      </p>
                    </div>
                  </div>
                  <div>
                    <Skeleton className="w-12 max-w-full bg-darkgray rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-12 h-12 flex items-center justify-center bg-darkgray rounded-lg">
                      <SVGSkeleton className="lucide-arrow-down-to-line w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <p>
                        <Skeleton className="w-40 max-w-full bg-darkgray rounded-lg animate-pulse" />
                      </p>
                      <p>
                        <Skeleton className="w-24 max-w-full bg-darkgray rounded-lg animate-pulse" />
                      </p>
                    </div>
                  </div>
                  <div>
                    <Skeleton className="w-12 max-w-full bg-darkgray rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-12 h-12 flex items-center justify-center bg-darkgray rounded-lg">
                      <SVGSkeleton className="lucide-arrow-down-to-line w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <p>
                        <Skeleton className="w-40 max-w-full bg-darkgray rounded-lg animate-pulse" />
                      </p>
                      <p>
                        <Skeleton className="w-24 max-w-full bg-darkgray rounded-lg animate-pulse" />
                      </p>
                    </div>
                  </div>
                  <div>
                    <Skeleton className="w-12 max-w-full bg-darkgray rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="-mx-5">
              <div className="grid grid-cols-4 items-center px-4 py-4 mt-4 border-t">
                <div className="inline-flex items-center justify-start transition-colors border-input h-9 border-0">
                  <Skeleton className="bg-darkgray w-8 max-w-full rounded-lg animate-pulse" />
                </div>
                <div className="col-span-2 justify-center flex">
                  <Skeleton className="bg-darkgray w-24 max-w-full rounded-lg animate-pulse" />
                </div>
                <div className="inline-flex items-center justify-end transition-colors border-input h-9 border-0">
                  <Skeleton className="bg-darkgray w-8 max-w-full rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default MyPointsSkeleton;
