import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[var(--radius-md)] border transition-[border-color,background-color] duration-150",
  {
    variants: {
      variant: {
        default: "bg-[var(--bg-surface)] border-[var(--border-subtle)]",
        elevated:
          "bg-[var(--bg-elevated)] border-[var(--border-default)] shadow-[0_4px_24px_rgba(0,0,0,0.4),0_1px_4px_rgba(0,0,0,0.3)]",
        interactive:
          "bg-[var(--bg-surface)] border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] focus-visible:outline-2 focus-visible:outline-[var(--operative-500)] focus-visible:outline-offset-2",
        status: "rounded-[var(--radius-sm)] border border-l-[3px]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-5",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mb-2", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-sans text-[18px] font-semibold leading-[1.4] tracking-[-0.01em] text-[var(--text-primary)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-sans text-[13px] text-[var(--text-tertiary)] leading-[1.6]",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
