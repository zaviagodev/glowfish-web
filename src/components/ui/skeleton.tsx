interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    aria-live="polite"
    aria-busy="true"
    className={className + " animate-pulse rounded-md bg-darkgray"}
  >
    <span className="inline-flex w-full select-none leading-none"></span>
    <br />
  </div>
);

const SVGSkeleton = ({ className }: SkeletonProps) => (
  <svg className={className + " animate-pulse rounded bg-darkgray"} />
);

export { Skeleton, SVGSkeleton };
