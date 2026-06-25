"use client";

import { useActionState, useState, useEffect, useRef, useCallback } from "react";
import { saveAssessmentAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/states/error-state";

const initialState = { error: null as string | null };

type TestPhase =
  | "intro"
  | "pushups_countdown"  | "pushups_test"   | "pushups_done"
  | "rest_1"
  | "squats_countdown"   | "squats_test"    | "squats_done"
  | "rest_2"
  | "plank_countdown"    | "plank_test"     | "plank_done"
  | "complete";

function CircleTimer({ seconds, max, color = "var(--operative-500)" }: { seconds: number; max: number; color?: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, seconds / max));
  const dash = circ * progress;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--white-08)" strokeWidth="6" />
        <circle
          cx="56" cy="56" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.1s linear" }}
        />
      </svg>
      <span
        className="font-mono font-bold tabular-nums"
        style={{ fontSize: "28px", color: "var(--text-primary)" }}
      >
        {seconds}
      </span>
    </div>
  );
}

export function StepAssessment() {
  const [state, formAction, isPending] = useActionState(saveAssessmentAction, initialState);
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [timer, setTimer] = useState(0);
  const [pushups, setPushups] = useState<number>(0);
  const [squats, setSquats]   = useState<number>(0);
  const [plankSec, setPlankSec] = useState<number>(0);
  const [plankRunning, setPlankRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startCountdown = useCallback((from: number, onDone: () => void) => {
    clearTimer();
    setTimer(from);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearTimer(); onDone(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const startCountup = useCallback((onDone: () => void) => {
    clearTimer();
    setTimer(60);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearTimer(); onDone(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // Phase transitions
  function beginPushups() {
    setPhase("pushups_countdown");
    startCountdown(3, () => {
      setPhase("pushups_test");
      startCountup(() => setPhase("pushups_done"));
    });
  }

  function beginSquats() {
    setPhase("squats_countdown");
    startCountdown(3, () => {
      setPhase("squats_test");
      startCountup(() => setPhase("squats_done"));
    });
  }

  function beginPlank() {
    setPhase("plank_countdown");
    startCountdown(3, () => {
      setPhase("plank_test");
      setPlankSec(0);
      setPlankRunning(true);
    });
  }

  // Plank count-up (user stops it)
  useEffect(() => {
    if (!plankRunning) return;
    intervalRef.current = setInterval(() => setPlankSec((s) => s + 1), 1000);
    return () => clearTimer();
  }, [plankRunning, clearTimer]);

  function stopPlank() {
    clearTimer();
    setPlankRunning(false);
    setPhase("plank_done");
  }

  function startRest(sec: number, next: () => void) {
    startCountdown(sec, next);
  }

  // ── Render ────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1
            className="font-display font-bold uppercase mb-2"
            style={{ fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
          >
            BASELINE ASSESSMENT
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
            Three quick tests to set your initial workout intensity. Takes about 5 minutes.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: "Push-up Test", detail: "Max reps in 60 seconds", icon: "💪" },
            { label: "Squat Test",   detail: "Max reps in 60 seconds", icon: "🦵" },
            { label: "Plank Hold",   detail: "Hold until failure",     icon: "🏋️" },
          ].map(({ label, detail, icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] border"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="p-3 rounded-[var(--radius-sm)] border text-[12px]"
          style={{ background: "var(--signal-900)", borderColor: "var(--signal-600)", color: "var(--signal-400)" }}
        >
          ⚠ Stop immediately if you feel pain. This assessment determines difficulty only — you can retake it later.
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" fullWidth onClick={beginPushups}>
            Begin Assessment →
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => setPhase("complete")}>
            Skip assessment (start as Recruit)
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "pushups_countdown" || phase === "squats_countdown" || phase === "plank_countdown") {
    const label = phase.includes("pushups") ? "PUSH-UP TEST" : phase.includes("squats") ? "SQUAT TEST" : "PLANK HOLD";
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <p className="type-callsign" style={{ fontSize: "13px" }}>{label}</p>
        <CircleTimer seconds={timer} max={3} color="var(--signal-500)" />
        <p className="font-display font-bold uppercase text-[36px]" style={{ color: "var(--text-primary)" }}>
          GET READY
        </p>
      </div>
    );
  }

  if (phase === "pushups_test") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <p className="type-callsign">PUSH-UP TEST</p>
        <CircleTimer seconds={timer} max={60} />
        <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>Count your reps — the timer stops automatically</p>
        <p className="font-display font-bold uppercase text-[20px]" style={{ color: "var(--operative-500)" }}>GO!</p>
      </div>
    );
  }

  if (phase === "pushups_done") {
    return (
      <div className="flex flex-col gap-5">
        <p className="type-callsign">PUSH-UP TEST — COMPLETE</p>
        <h2 className="type-heading-lg">How many push-ups did you complete?</h2>
        <div>
          <Label htmlFor="pushupsInput">Push-up count</Label>
          <Input
            id="pushupsInput"
            type="number"
            min={0}
            max={200}
            value={pushups || ""}
            onChange={(e) => setPushups(parseInt(e.target.value) || 0)}
            placeholder="Enter your rep count"
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            setPhase("rest_1");
            startRest(30, beginSquats);
          }}
        >
          Log {pushups} Push-ups →
        </Button>
      </div>
    );
  }

  if (phase === "rest_1" || phase === "rest_2") {
    const next = phase === "rest_1" ? "Squat Test" : "Plank Hold";
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <p className="type-callsign" style={{ color: "var(--intel-400)" }}>REST</p>
        <CircleTimer seconds={timer} max={30} color="var(--intel-500)" />
        <p className="font-display font-bold uppercase text-[24px]" style={{ color: "var(--text-primary)" }}>
          Prepare for {next}
        </p>
        <Button variant="secondary" size="sm" onClick={() => {
          clearTimer();
          phase === "rest_1" ? beginSquats() : beginPlank();
        }}>
          Skip rest
        </Button>
      </div>
    );
  }

  if (phase === "squats_test") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <p className="type-callsign">SQUAT TEST</p>
        <CircleTimer seconds={timer} max={60} />
        <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>Full depth squats — count every rep</p>
        <p className="font-display font-bold uppercase text-[20px]" style={{ color: "var(--operative-500)" }}>GO!</p>
      </div>
    );
  }

  if (phase === "squats_done") {
    return (
      <div className="flex flex-col gap-5">
        <p className="type-callsign">SQUAT TEST — COMPLETE</p>
        <h2 className="type-heading-lg">How many squats did you complete?</h2>
        <div>
          <Label htmlFor="squatsInput">Squat count</Label>
          <Input
            id="squatsInput"
            type="number"
            min={0}
            max={200}
            value={squats || ""}
            onChange={(e) => setSquats(parseInt(e.target.value) || 0)}
            placeholder="Enter your rep count"
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            setPhase("rest_2");
            startRest(30, beginPlank);
          }}
        >
          Log {squats} Squats →
        </Button>
      </div>
    );
  }

  if (phase === "plank_test") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <p className="type-callsign">PLANK HOLD</p>
        <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4" style={{ borderColor: "var(--operative-500)" }}>
          <span className="font-mono font-bold tabular-nums" style={{ fontSize: "28px", color: "var(--text-primary)" }}>
            {plankSec}s
          </span>
        </div>
        <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>Hold your plank — tap STOP when you drop</p>
        <Button variant="destructive" size="lg" onClick={stopPlank}>
          ⬛ STOP
        </Button>
      </div>
    );
  }

  if (phase === "plank_done") {
    return (
      <div className="flex flex-col gap-5">
        <p className="type-callsign">PLANK HOLD — COMPLETE</p>
        <h2 className="type-heading-lg">
          You held for <span style={{ color: "var(--operative-500)" }}>{plankSec} seconds</span>
        </h2>
        <div
          className="p-4 rounded-[var(--radius-md)] border"
          style={{ background: "var(--operative-900)", borderColor: "var(--operative-600)" }}
        >
          <p className="text-[13px] font-semibold" style={{ color: "var(--operative-400)" }}>
            Your assessment score has been recorded. Tap below to see your rank.
          </p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={() => setPhase("complete")}>
          See My Results →
        </Button>
      </div>
    );
  }

  // "complete" phase — submit hidden form with all scores
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="pushups"  value={pushups} />
      <input type="hidden" name="squats"   value={squats} />
      <input type="hidden" name="plankSec" value={plankSec} />

      <div>
        <h2 className="type-heading-lg mb-4">Assessment Summary</h2>
        <div className="flex flex-col gap-2">
          {[
            { label: "Push-ups", value: `${pushups} reps`, icon: "💪" },
            { label: "Squats",   value: `${squats} reps`,  icon: "🦵" },
            { label: "Plank",    value: `${plankSec}s`,    icon: "🏋️" },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <span className="flex items-center gap-2 text-[14px]" style={{ color: "var(--text-secondary)" }}>
                <span>{icon}</span>{label}
              </span>
              <span className="font-mono font-bold text-[14px]" style={{ color: "var(--operative-400)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {state?.error && <FieldError message={state.error} />}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
        {isPending ? "Analysing..." : "Reveal My Rank →"}
      </Button>
    </form>
  );
}
