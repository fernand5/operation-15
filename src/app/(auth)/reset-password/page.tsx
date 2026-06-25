"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth";
import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/states/error-state";

const initialState = { error: null as string | null };

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-8"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      <AuthBrand />

      <h1
        className="font-display font-bold uppercase mb-1"
        style={{ fontSize: "24px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
      >
        NEW CREDENTIALS
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
        Set a new password for your account.
      </p>

      <form action={formAction} noValidate>
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters"
              required
              disabled={isPending}
              error={state?.error?.toLowerCase().includes("password")}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              required
              disabled={isPending}
              error={state?.error?.toLowerCase().includes("match")}
            />
          </div>

          {state?.error && <FieldError message={state.error} />}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isPending}
          >
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>

      <p
        className="text-center text-[12px] mt-6"
        style={{ color: "var(--text-disabled)" }}
      >
        <Link
          href="/login"
          className="font-semibold uppercase tracking-[0.04em]"
          style={{ color: "var(--operative-400)" }}
        >
          ← Back to Login
        </Link>
      </p>
    </div>
  );
}
