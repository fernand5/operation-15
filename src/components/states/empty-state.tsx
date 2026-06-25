import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        "py-12 px-8 max-w-xs mx-auto",
        className
      )}
    >
      {/* Icon container */}
      <div className="w-20 h-20 rounded-[var(--radius-full)] bg-[var(--white-06)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
        <Icon
          className="w-8 h-8 text-[var(--text-tertiary)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <h3 className="font-sans text-[18px] font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="font-sans text-[13px] text-[var(--text-tertiary)] leading-relaxed mb-6">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 w-full max-w-[240px]">
          {action && (
            <Button
              variant={action.variant ?? "primary"}
              size="md"
              fullWidth
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Pre-built empty states for common contexts ─────────────── */
import {
  Crosshair,
  Users,
  ShieldCheck,
  SearchX,
  WifiOff,
  Lock,
  Dumbbell,
  TrendingUp,
  Utensils,
} from "lucide-react";

export const EmptyStates = {
  NoMissions: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Crosshair}
      title="NO ACTIVE MISSIONS"
      description="Deploy your first mission to begin tracking operations."
      {...props}
    />
  ),

  NoSquad: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Users}
      title="SQUAD IS EMPTY"
      description="No operators assigned. Add team members to begin."
      {...props}
    />
  ),

  SectorClear: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={ShieldCheck}
      title="SECTOR CLEAR"
      description="All systems nominal. No alerts to display."
      {...props}
    />
  ),

  NoResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={SearchX}
      title="NO TARGETS FOUND"
      description="Adjust your parameters and try again."
      {...props}
    />
  ),

  Offline: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={WifiOff}
      title="SIGNAL LOST"
      description="Check your connection and re-establish."
      {...props}
    />
  ),

  Locked: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Lock}
      title="CLASSIFIED"
      description="Upgrade to access this operation module."
      {...props}
    />
  ),

  NoWorkouts: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Dumbbell}
      title="NO WORKOUTS LOGGED"
      description="Complete your first mission to see your training history."
      {...props}
    />
  ),

  NoProgress: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={TrendingUp}
      title="NO DATA YET"
      description="Complete missions and log metrics to track your progress."
      {...props}
    />
  ),

  NoNutrition: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Utensils}
      title="NO RATIONS LOGGED"
      description="Log your first meal to start tracking field rations."
      {...props}
    />
  ),
} as const;
