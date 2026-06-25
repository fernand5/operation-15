"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveGenderAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/states/error-state";

const initialState = { error: null as string | null };

const PRESETS = ["Man", "Woman", "Non-binary", "Genderqueer", "Agender", "Prefer not to say"];

export function StepGender() {
  const [state, formAction, isPending] = useActionState(saveGenderAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <h1
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          GENDER IDENTITY
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
          Optional. Used only for profile display and personalisation — never for calculations.
        </p>
      </div>

      {/* Quick-select pills */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="px-3 py-1.5 rounded-[var(--radius-full)] border text-[12px] font-semibold transition-colors"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            onClick={() => {
              const input = document.getElementById("genderIdentity") as HTMLInputElement;
              if (input) input.value = preset;
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      <div>
        <Label htmlFor="genderIdentity">
          Gender Identity <span style={{ color: "var(--text-disabled)", fontWeight: 400 }}>(optional)</span>
        </Label>
        <Input
          id="genderIdentity"
          name="genderIdentity"
          type="text"
          placeholder="Select above or type your own"
          maxLength={100}
          disabled={isPending}
        />
      </div>

      {state?.error && <FieldError message={state.error} />}

      <div className="flex flex-col gap-2">
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
          {isPending ? "Saving..." : "Continue →"}
        </Button>
        <Button
          type="submit"
          variant="ghost"
          size="md"
          fullWidth
          disabled={isPending}
          formAction={async (fd: FormData) => {
            fd.set("genderIdentity", "");
            return formAction(fd);
          }}
        >
          Skip this step
        </Button>
      </div>
    </form>
  );
}
