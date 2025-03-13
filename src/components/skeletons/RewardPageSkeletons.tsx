import { Skeleton, SVGSkeleton } from "../ui/skeleton";

const RewardPageSkeletons = () => (
  <section className="pt-14">
    <div className="flex items-center justify-between p-5 pb-0">
      <h1 className="m-0">
        <Skeleton className="w-[88px] max-w-full" />
      </h1>
      <span className="relative flex shrink-0 h-[50px] w-[50px]">
        <SVGSkeleton className="aspect-square w-full h-full rounded-full" />
      </span>
    </div>
    <div className="h-[250px] relative p-5">
      <SVGSkeleton className="object-cover opacity-75 w-full h-full" />
    </div>
    <div className="h-[100px] relative p-5">
      <SVGSkeleton className="object-cover opacity-75 w-full h-full" />
    </div>
    <div className="px-5 pb-7">
      <h3 className="mb-4">
        <Skeleton className="w-[56px] max-w-full" />
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative max-h-[220px] h-[60vw] w-full">
          <SVGSkeleton className="object-cover object-top w-full h-full" />
        </div>
        <div className="relative max-h-[220px] h-[60vw] w-full">
          <SVGSkeleton className="object-cover object-top w-full h-full" />
        </div>
        <div className="relative max-h-[220px] h-[60vw] w-full">
          <SVGSkeleton className="object-cover object-top w-full h-full" />
        </div>
        <div className="relative max-h-[220px] h-[60vw] w-full">
          <SVGSkeleton className="object-cover object-top w-full h-full" />
        </div>
      </div>
    </div>
  </section>
);

export default RewardPageSkeletons;
