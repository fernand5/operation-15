"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-sans text-[13px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap",
    "border border-transparent rounded-[var(--radius-sm)]",
    "cursor-pointer select-none",
    "transition-[background-color,border-color,color,box-shadow,transform]",
    "duration-[120ms] ease-[var(--ease-in-out)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--operative-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]",
    "active:translate-y-px",
    "disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--operative-500)] text-[var(--ground-950)]",
          "hover:bg-[var(--operative-400)]",
          "active:bg-[var(--operative-600)]",
        ],
        secondary: [
          "bg-[var(--white-08)] text-[var(--text-primary)] border-[var(--border-default)]",
          "hover:bg-[var(--white-12)] hover:border-[var(--border-strong)]",
        ],
        ghost: [
          "bg-transparent text-[var(--text-secondary)]",
          "hover:bg-[var(--white-06)] hover:text-[var(--text-primary)]",
        ],
        destructive: [
          "bg-[var(--breach-900)] text-[var(--breach-400)] border-[var(--breach-600)]",
          "hover:bg-[var(--breach-800)] hover:border-[var(--breach-500)]",
        ],
        warning: [
          "bg-[var(--signal-900)] text-[var(--signal-400)] border-[var(--signal-600)]",
          "hover:bg-[var(--signal-800)] hover:border-[var(--signal-500)]",
        ],
        intel: [
          "bg-transparent text-[var(--intel-400)]",
          "hover:bg-[var(--intel-900)]",
        ],
        premium: [
          "bg-gradient-to-br from-[var(--classified-600)] to-[var(--classified-500)] text-white",
          "hover:brightness-[1.15]",
        ],
      },
      size: {
        xs: "px-2 py-1 text-[11px] min-h-[28px]",
        sm: "px-3 py-1.5 text-[12px] min-h-[36px]",
        md: "px-4 py-2 text-[13px] min-h-[44px]",
        lg: "px-6 py-3 text-[14px] min-h-[52px]",
        xl: "px-8 py-4 text-[15px] min-h-[60px]",
        icon: "p-2 min-w-[44px] min-h-[44px]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, asChild = false, loading, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-[14px] h-[14px] border-2 border-current border-r-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
