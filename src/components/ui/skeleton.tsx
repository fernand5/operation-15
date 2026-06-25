import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "rounded-[var(--radius-xs)] bg-[var(--white-08)] animate-[skeleton-pulse_1.5s_ease-in-out_infinite]",
  {
    variants: {
      variant: {
        text:   "h-[14px]",
        title:  "h-[22px]",
        avatar: "rounded-[var(--radius-full)]",
        card:   "rounded-[var(--radius-md)] min-h-[120px]",
        button: "h-11 rounded-[var(--radius-sm)]",
      },
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, className }))}
      aria-hidden="true"
      {...props}
    />
  );
}

/* Shimmer variant for lists and table rows */
function SkeletonShimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xs)]",
        "bg-[length:800px_100%]",
        "animate-[shimmer_1.4s_ease-in-out_infinite]",
        "[background-image:linear-gradient(90deg,var(--white-06)_25%,var(--white-12)_50%,var(--white-06)_75%)]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/* Pre-built skeleton layouts */
function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="title" className="w-1/2" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton className="h-[4px] w-full rounded-full mt-4" />
    </div>
  );
}

function SkeletonMetricCard() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2">
      <Skeleton className="h-[10px] w-20" />
      <Skeleton className="h-[32px] w-16" />
      <Skeleton className="h-[10px] w-24" />
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border-subtle)]">
      <Skeleton variant="avatar" className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-2/3" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonShimmer, SkeletonCard, SkeletonMetricCard, SkeletonListItem };
