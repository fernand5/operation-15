"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/* ── Types ─────────────────────────────────────────────────── */
export interface AuthResult {
  error: string | null;
  success?: boolean;
}

/* ── Login ──────────────────────────────────────────────────── */
export async function loginAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: "Invalid credentials. Check your email and password." };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (err) {
    // redirect() throws internally — let it propagate
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again later." };
  }
}

/* ── Register ───────────────────────────────────────────────── */
export async function registerAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const displayName = (formData.get("displayName") as string)?.trim();

    if (!email || !password || !displayName) {
      return { error: "All fields are required." };
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    if (displayName.length < 2 || displayName.length > 40) {
      return { error: "Display name must be 2–40 characters." };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback?next=/onboarding/1`,
        data: { display_name: displayName },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return { error: "An account with this email already exists." };
      }
      return { error: "Registration failed. Please try again." };
    }

    return { success: true, error: null };
  } catch {
    return { error: "Service unavailable. Please try again later." };
  }
}

/* ── Forgot password ────────────────────────────────────────── */
export async function forgotPasswordAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    const email = formData.get("email") as string;

    if (!email) {
      return { error: "Email address is required." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { error: "Failed to send reset email. Please try again." };
    }

    return { success: true, error: null };
  } catch {
    return { error: "Service unavailable. Please try again later." };
  }
}

/* ── Reset password (after email link) ──────────────────────── */
export async function resetPasswordAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
      return { error: "Both fields are required." };
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: "Failed to update password. Your reset link may have expired." };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again later." };
  }
}

/* ── Sign in with OAuth provider ────────────────────────────── */
export async function oAuthSignInAction(
  provider: "google" | "apple"
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { url: null, error: "OAuth sign-in failed. Please try again." };
  }

  return { url: data.url, error: null };
}

/* ── Logout ─────────────────────────────────────────────────── */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
