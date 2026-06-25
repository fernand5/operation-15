"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { AuthBrand } from "@/components/auth/auth-brand";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, AlertBanner } from "@/components/states/error-state";

const initialState = { error: null as string | null, success: false };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [agreed, setAgreed] = useState(false);

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
          <span className="text-2xl">✓</span>
        </div>
        <h2
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "22px", color: "var(--text-primary)" }}
        >
          CHECK YOUR EMAIL
        </h2>
        <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
          Confirmation orders dispatched. Click the link in your email to activate your account.
        </p>
        <AlertBanner
          variant="success"
          message="Confirmation email sent. Check your inbox and spam folder."
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
        ENLIST
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
        Create your operator account.
      </p>

      <OAuthButtons action="register" />
      <AuthDivider />

      <form action={formAction} noValidate>
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">
              Display Name / Callsign <span style={{ color: "var(--breach-500)" }}>*</span>
            </Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="nickname"
              placeholder="Your callsign"
              maxLength={40}
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="email">
              Email <span style={{ color: "var(--breach-500)" }}>*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="operator@email.com"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="password">
              Password <span style={{ color: "var(--breach-500)" }}>*</span>
            </Label>
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
            <Label htmlFor="confirmPassword">
              Confirm Password <span style={{ color: "var(--breach-500)" }}>*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              required
              disabled={isPending}
              error={state?.error?.toLowerCase().includes("match")}
            />
          </div>

          {/* Terms agreement */}
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              disabled={isPending}
              className="mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-[12px] leading-relaxed cursor-pointer"
              style={{ color: "var(--text-tertiary)" }}
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="underline transition-colors"
                style={{ color: "var(--text-link)" }}
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline transition-colors"
                style={{ color: "var(--text-link)" }}
                target="_blank"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {state?.error && <FieldError message={state.error} />}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isPending}
            disabled={!agreed || isPending}
            className="mt-2"
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>

      <p
        className="text-center text-[12px] mt-6"
        style={{ color: "var(--text-disabled)" }}
      >
        Already enlisted?{" "}
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
