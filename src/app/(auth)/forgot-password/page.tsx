"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth";
import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, AlertBanner } from "@/components/states/error-state";

const initialState = { error: null as string | null, success: false };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state?.success) {
    return (
      <div
        className="rounded-[var(--radius-lg)] border p-8 text-center"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--operative-900)", border: "1px solid var(--operative-600)" }}
        >
          <span className="text-2xl">📡</span>
        </div>
        <h2
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "22px", color: "var(--text-primary)" }}
        >
          SIGNAL SENT
        </h2>
        <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
          If that email is in our system, a reset link has been dispatched. Check your inbox.
        </p>
        <AlertBanner
          variant="info"
          message="Reset link expires in 1 hour. Check your spam folder if not received."
        />
        <Link
          href="/login"
          className="block mt-6 text-[12px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "var(--operative-400)" }}
        >
          ← Back to Login
        </Link>
      </div>
    );
  }

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
        RESET ACCESS
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
        Enter your email. We&apos;ll send reset orders if the account exists.
      </p>

      <form action={formAction} noValidate>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="operator@email.com"
              required
              disabled={isPending}
              error={!!state?.error}
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
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>

      <p
        className="text-center text-[12px] mt-6"
        style={{ color: "var(--text-disabled)" }}
      >
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold uppercase tracking-[0.04em]"
          style={{ color: "var(--operative-400)" }}
        >
          Sign In →
        </Link>
      </p>
    </div>
  );
}
