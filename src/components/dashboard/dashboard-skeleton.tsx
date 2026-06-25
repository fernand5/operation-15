import { SkeletonCard, SkeletonMetricCard, Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ATLAS brief skeleton */}
      <div
        className="rounded-[var(--radius-md)] p-4 flex gap-3"
        style={{ background: "var(--operative-900)", border: "1px solid var(--operative-800)", borderLeft: "3px solid var(--operative-600)" }}
      >
        <Skeleton className="w-8 h-8 rounded flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>

      {/* Section label */}
      <Skeleton className="h-3 w-32" />

      {/* Mission card skeleton */}
      <SkeletonCard />

      {/* Section label */}
      <Skeleton className="h-3 w-24 mt-2" />

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>

      {/* Streak strip skeleton */}
      <div
        className="rounded-[var(--radius-md)] border p-4 space-y-3"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-2 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-1.5 items-end">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-[2px]" />
          ))}
        </div>
      </div>

      {/* Rank progress skeleton */}
      <div
        className="rounded-[var(--radius-md)] border p-4 space-y-3"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-2 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-[4px] w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
