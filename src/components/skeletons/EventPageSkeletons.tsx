import { Skeleton, SVGSkeleton } from "../ui/skeleton";

const EventPageSkeletons = () => (
  <div className="relative w-full h-full rounded-lg">
    <div className="relative w-full max-h-[360px] h-[60vw]">
      <SVGSkeleton className="object-cover object-top w-full h-full" />
    </div>
  </div>
);

export default EventPageSkeletons;
