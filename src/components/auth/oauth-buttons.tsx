"use client";

import { useState } from "react";
import { oAuthSignInAction } from "@/actions/auth";
import { Spinner } from "@/components/states/loading-states";

/* Inline SVG icons to avoid external deps */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M14.04 9.56c-.02-2.07 1.69-3.07 1.77-3.12-1.46-1.34-2.57-.94-3.04-.91-1.31.13-2.57.78-3.24.78-.67 0-1.71-.76-2.81-.74-1.44.02-2.78.84-3.52 2.13-1.51 2.61-.38 6.47 1.08 8.59.72 1.04 1.57 2.2 2.69 2.16 1.08-.04 1.49-.7 2.8-.7 1.3 0 1.66.7 2.8.68 1.16-.02 1.9-1.06 2.6-2.11.52-.75.91-1.58 1.14-2.44-2.44-.93-2.27-4.32-.27-4.32Z" fill="currentColor"/>
      <path d="M11.89 3.36C12.48 2.64 12.88 1.66 12.76.65c-.86.05-1.9.58-2.51 1.31-.55.66-1.03 1.65-.89 2.62.93.07 1.89-.46 2.53-1.22Z" fill="currentColor"/>
    </svg>
  );
}

interface OAuthButtonsProps {
  action: "login" | "register";
}

export function OAuthButtons({ action }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(provider);
    setError(null);
    try {
      const result = await oAuthSignInAction(provider);
      if (result.error || !result.url) {
        setError(result.error ?? "Sign-in failed.");
        setLoading(null);
        return;
      }
      window.location.href = result.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const label = action === "login" ? "Continue" : "Sign up";

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-[12px] text-center" style={{ color: "var(--breach-400)" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={loading !== null}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-[var(--radius-sm)] border text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--white-06)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--white-12)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--white-06)")}
      >
        {loading === "google" ? <Spinner size="sm" /> : <GoogleIcon />}
        {label} with Google
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("apple")}
        disabled={loading !== null}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-[var(--radius-sm)] border text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--white-06)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--white-12)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--white-06)")}
      >
        {loading === "apple" ? <Spinner size="sm" /> : <AppleIcon />}
        {label} with Apple
      </button>
    </div>
  );
}
