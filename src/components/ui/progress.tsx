"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative overflow-hidden rounded-[var(--radius-full)] bg-[var(--white-08)]",
  {
    variants: {
      size: {
        xs: "h-[2px]",
        sm: "h-[4px]",
        md: "h-[6px]",
        lg: "h-[8px]",
      },
    },
    defaultVariants: { size: "sm" },
  }
);

const fillVariants = cva(
  "h-full rounded-[var(--radius-full)] transition-[width] duration-[600ms] cubic-bezier(0.4,0,0.2,1)",
  {
    variants: {
      color: {
        operative: "bg-gradient-to-r from-[var(--operative-600)] to-[var(--operative-500)]",
        signal:    "bg-gradient-to-r from-[var(--signal-600)]    to-[var(--signal-500)]",
        breach:    "bg-gradient-to-r from-[var(--breach-600)]    to-[var(--breach-500)]",
        intel:     "bg-gradient-to-r from-[var(--intel-600)]     to-[var(--intel-500)]",
      },
    },
    defaultVariants: { color: "operative" },
  }
);

type ProgressColor = "operative" | "signal" | "breach" | "intel";
type ProgressSize = "xs" | "sm" | "md" | "lg";

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "color"> {
  value?: number;
  size?: ProgressSize;
  color?: ProgressColor;
  className?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, size, color, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ size, className }))}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(fillVariants({ color }))}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
