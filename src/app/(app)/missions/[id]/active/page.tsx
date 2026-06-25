import type { Metadata } from "next";
import { ActiveWorkout } from "@/components/workout/active-workout";
import { startSessionAction } from "@/actions/workout";

export const metadata: Metadata = { title: "Active Mission" };

// Force dynamic — this page starts a DB session on render
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActiveWorkoutPage({ params }: PageProps) {
  const { id } = await params;

  // Start session server-side so the session ID is available immediately
  const { sessionId } = await startSessionAction(id);

  return (
    <ActiveWorkout
      sessionId={sessionId ?? `mock-${Date.now()}`}
      workoutId={id}
    />
  );
}
