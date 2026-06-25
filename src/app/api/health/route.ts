import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  let dbStatus: "ok" | "error" = "error";
  let dbLatencyMs = 0;

  try {
    const supabase = await createClient();
    const dbStart = Date.now();
    await supabase.from("ranks").select("id").limit(1).single();
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "ok";
  } catch {
    dbStatus = "error";
  }

  const totalMs = Date.now() - start;
  const healthy = dbStatus === "ok";

  return NextResponse.json(
    {
      status:  healthy ? "ok" : "degraded",
      version: process.env.npm_package_version ?? "0.1.0",
      uptime:  process.uptime(),
      checks: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
        api:      { status: "ok",     latencyMs: totalMs },
      },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
