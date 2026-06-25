"use client";

import { useState, useEffect, useTransition } from "react";
import { advanceToStep7Action } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";

export function StepRankReveal() {
  const [stage, setStage] = useState<"waiting" | "animating" | "revealed">("waiting");
  const [isPending, startTransition] = useTransition();

  // Auto-play after a brief pause
  useEffect(() => {
    const t = setTimeout(() => setStage("animating"), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stage !== "animating") return;
    const t = setTimeout(() => setStage("revealed"), 2000);
    return () => clearTimeout(t);
  }, [stage]);

  function handleContinue() {
    startTransition(() => advanceToStep7Action());
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <p className="type-callsign" style={{ letterSpacing: "0.2em" }}>
        BY ORDER OF OPERATION 15 HIGH COMMAND
      </p>

      {/* Rank insignia animation */}
      <div className="relative">
        {/* Radar rings */}
        {stage === "animating" && (
          <>
            <div
              className="absolute inset-[-20px] rounded-full border-2"
              style={{
                borderColor: "var(--operative-500)",
                animation: "radar-ping 1.2s ease-out forwards",
              }}
            />
            <div
              className="absolute inset-[-20px] rounded-full border-2"
              style={{
                borderColor: "var(--operative-500)",
                animation: "radar-ping 1.2s ease-out 0.4s forwards",
              }}
            />
          </>
        )}

        {/* Rank badge */}
        <div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-700"
          style={{
            background: stage === "revealed"
              ? "linear-gradient(135deg, var(--operative-900), var(--operative-800))"
              : "var(--bg-elevated)",
            borderColor: stage === "revealed" ? "var(--operative-500)" : "var(--border-default)",
            boxShadow: stage === "revealed"
              ? "0 0 40px rgba(0, 230, 118, 0.3), 0 0 80px rgba(0, 230, 118, 0.1)"
              : "none",
            transform: stage === "animating" ? "scale(1.05)" : "scale(1)",
          }}
        >
          {stage === "waiting" || stage === "animating" ? (
            <div className="text-3xl animate-pulse">⬛</div>
          ) : (
            <>
              <span className="text-3xl">🪖</span>
              <span
                className="font-mono font-bold text-[11px] uppercase tracking-[0.12em] mt-1"
                style={{ color: "var(--operative-500)" }}
              >
                E-1
              </span>
            </>
          )}
        </div>
      </div>

      {/* Rank text */}
      <div
        className="transition-all duration-500"
        style={{ opacity: stage === "revealed" ? 1 : 0, transform: stage === "revealed" ? "translateY(0)" : "translateY(12px)" }}
      >
        <h1
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(32px, 8vw, 56px)", letterSpacing: "-0.02em", color: "var(--operative-500)" }}
        >
          RECRUIT
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          Rank 1 of 8 — Every legend starts here.
        </p>
      </div>

      {/* XP goal */}
      {stage === "revealed" && (
        <div
          className="w-full p-4 rounded-[var(--radius-md)] border"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            animation: "slide-up 300ms ease forwards",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="type-label-md">XP to Private</span>
            <span className="font-mono text-[13px]" style={{ color: "var(--operative-400)" }}>0 / 500 XP</span>
          </div>
          <div className="h-[4px] rounded-full" style={{ background: "var(--white-08)" }}>
            <div className="h-full w-0 rounded-full" style={{ background: "var(--operative-500)" }} />
          </div>
        </div>
      )}

      {stage === "revealed" && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          onClick={handleContinue}
          style={{ animation: "slide-up 400ms ease forwards" }}
        >
          {isPending ? "Loading..." : "See Your Mission Plan →"}
        </Button>
      )}
    </div>
  );
}
