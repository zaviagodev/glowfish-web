import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmerDelay?: number;
}

export function Skeleton({
  className,
  shimmerDelay = 0,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/40",
        "after:absolute after:inset-0",
        "after:translate-x-[-100%]",
        "after:animate-[shimmer_2s_infinite]",
        "after:bg-gradient-to-r",
        "after:from-transparent after:via-white/10 after:to-transparent",
        "transition-opacity duration-500 ease-in-out",
        className
      )}
      style={{
        animationDelay: `${shimmerDelay}ms`
      }}
      {...props}
    />
  )
}