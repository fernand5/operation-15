"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { AuthBrand } from "@/components/auth/auth-brand";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, AlertBanner } from "@/components/states/error-state";

const initialState = { error: null as string | null };

/* Isolated to its own component so Suspense can wrap it */
function CallbackErrorBanner() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  if (!callbackError) return null;
  return (
    <div className="mb-4">
      <AlertBanner variant="error" message="Authentication failed. Please try again." />
    </div>
  );
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
        DEPLOY
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
        Sign in to your operator account.
      </p>

      <Suspense fallback={null}>
        <CallbackErrorBanner />
      </Suspense>

      <OAuthButtons action="login" />
      <AuthDivider />

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
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="mb-0">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors"
                style={{ color: "var(--text-link)" }}
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
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
            className="mt-2"
          >
            {isPending ? "Authenticating..." : "Sign In"}
          </Button>
        </div>
      </form>

      <p className="text-center text-[12px] mt-6" style={{ color: "var(--text-disabled)" }}>
        No account?{" "}
        <Link
          href="/register"
          className="font-semibold uppercase tracking-[0.04em] transition-colors"
          style={{ color: "var(--operative-400)" }}
        >
          Enlist →
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
