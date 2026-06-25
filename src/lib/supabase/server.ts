import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Database generic removed here — use `supabase gen types typescript` to
// regenerate `src/types/database.ts` from a live Supabase project and
// re-add it once connected.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies can only
            // be set in middleware or a Route Handler. Safe to ignore.
          }
        },
      },
    }
  );
}
