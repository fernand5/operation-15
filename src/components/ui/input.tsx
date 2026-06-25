import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[var(--radius-sm)] border px-3 py-2",
        "bg-[var(--bg-input)] text-[var(--text-primary)] text-[15px]",
        "placeholder:text-[var(--text-disabled)]",
        "transition-[border-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:border-[var(--operative-500)] focus-visible:ring-2 focus-visible:ring-[var(--operative-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error
          ? "border-[var(--breach-500)] bg-[var(--breach-900)] focus-visible:ring-[var(--breach-500)] focus-visible:border-[var(--breach-500)]"
          : "border-[var(--border-default)]",
        className
      )}
      aria-invalid={error}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
