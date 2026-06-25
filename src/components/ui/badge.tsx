import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-xs)] font-sans text-[10px] font-bold uppercase tracking-[0.1em] border px-[6px] py-[2px]",
  {
    variants: {
      variant: {
        success:     "bg-[var(--operative-900)] text-[var(--operative-500)] border-[var(--operative-600)]",
        warning:     "bg-[var(--signal-900)]    text-[var(--signal-500)]    border-[var(--signal-600)]",
        error:       "bg-[var(--breach-900)]    text-[var(--breach-400)]    border-[var(--breach-600)]",
        info:        "bg-[var(--intel-900)]     text-[var(--intel-400)]     border-[var(--intel-600)]",
        premium:     "bg-[var(--classified-900)] text-[var(--classified-400)] border-[var(--classified-600)]",
        default:     "bg-[var(--white-08)]      text-[var(--text-secondary)] border-[var(--border-default)]",
        outline:     "bg-transparent           text-[var(--text-tertiary)]  border-[var(--border-default)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
