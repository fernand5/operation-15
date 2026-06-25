/* ============================================================
   OPERATION 15 — Workout Engine
   Sacred 15-Minute Formula Builder
   ============================================================ */

export type PhaseType =
  | "activation"
  | "circuit_a"
  | "circuit_b"
  | "finisher"
  | "decompression";

export type SegmentType = "prepare" | "work" | "rest";

export interface WorkoutSegment {
  id: string;
  type: SegmentType;
  phase: PhaseType;
  duration: number;          // seconds
  exerciseName?: string;
  instructions?: string;
  cues?: string[];
  round?: number;
  totalRounds?: number;
  avatarAnimationUrl?: string | null;
  muscleGroups?: string[];
}

export interface WorkoutDefinition {
  id: string;
  title: string;
  operationName: string;
  xpReward: number;
  estimatedCalories: number;
  segments: WorkoutSegment[];
}

export function buildSegments(def: WorkoutDefinition): WorkoutSegment[] {
  return def.segments;
}

export function getTotalDuration(segments: WorkoutSegment[]): number {
  return segments.reduce((acc, s) => acc + s.duration, 0);
}

/** Find the segment index for a given elapsed time */
export function getSegmentAt(segments: WorkoutSegment[], elapsed: number) {
  let cumulative = 0;
  for (let i = 0; i < segments.length; i++) {
    cumulative += segments[i].duration;
    if (elapsed < cumulative) {
      const segmentElapsed = elapsed - (cumulative - segments[i].duration);
      return {
        segment: segments[i],
        index: i,
        segmentElapsed,
        segmentRemaining: segments[i].duration - segmentElapsed,
        total: segments.length,
      };
    }
  }
  // Past end
  return {
    segment: segments[segments.length - 1],
    index: segments.length - 1,
    segmentElapsed: segments[segments.length - 1].duration,
    segmentRemaining: 0,
    total: segments.length,
  };
}

export function getCompletionPct(segments: WorkoutSegment[], elapsed: number): number {
  const total = getTotalDuration(segments);
  return Math.min(100, (elapsed / total) * 100);
}

/* ── Mock workout — Operation Thunder (Lower Body Power) ─── */
export const OPERATION_THUNDER: WorkoutDefinition = {
  id: "op-thunder-w1d1",
  title: "Lower Body Power",
  operationName: "Operation Thunder",
  xpReward: 100,
  estimatedCalories: 320,
  segments: [
    // ── ACTIVATION (2 min = 120s) ─────────────────────────
    {
      id: "act-prep",
      type: "prepare",
      phase: "activation",
      duration: 5,
      exerciseName: "Activation Phase",
      instructions: "Warm up your joints. Move with intention.",
    },
    {
      id: "act-1",
      type: "work",
      phase: "activation",
      duration: 45,
      exerciseName: "Glute Bridge",
      instructions: "Lie on back, feet flat, drive hips up. Squeeze glutes at top.",
      cues: ["Drive through heels", "Squeeze at the top", "Control the descent"],
      muscleGroups: ["Glutes", "Hamstrings", "Lower Back"],
    },
    { id: "act-rest-1", type: "rest", phase: "activation", duration: 10 },
    {
      id: "act-2",
      type: "work",
      phase: "activation",
      duration: 45,
      exerciseName: "Hip Circles",
      instructions: "Wide stance, hands on hips. Slow circles to open the hips.",
      cues: ["Full range of motion", "Stay controlled", "Both directions"],
      muscleGroups: ["Hip Flexors", "Glutes", "Adductors"],
    },
    { id: "act-rest-2", type: "rest", phase: "activation", duration: 15 },

    // ── CIRCUIT A (4 min = 240s) ──────────────────────────
    { id: "ca-prep", type: "prepare", phase: "circuit_a", duration: 5,
      exerciseName: "Circuit A — Primary", instructions: "2 rounds. Push hard." },
    // Round 1
    {
      id: "ca-1a", type: "work", phase: "circuit_a", duration: 40,
      exerciseName: "Squat", round: 1, totalRounds: 2,
      instructions: "Feet shoulder-width, chest up. Descend until thighs are parallel.",
      cues: ["Chest up", "Knees track toes", "Drive through heels"],
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    { id: "ca-rest-1a", type: "rest", phase: "circuit_a", duration: 20 },
    {
      id: "ca-1b", type: "work", phase: "circuit_a", duration: 40,
      exerciseName: "Jump Squat", round: 1, totalRounds: 2,
      instructions: "Lower into squat then explode upward. Land softly.",
      cues: ["Explode upward", "Land with soft knees", "Stay on the balls of your feet"],
      muscleGroups: ["Quads", "Glutes", "Calves"],
    },
    { id: "ca-rest-1b", type: "rest", phase: "circuit_a", duration: 20 },
    // Round 2
    {
      id: "ca-2a", type: "work", phase: "circuit_a", duration: 40,
      exerciseName: "Squat", round: 2, totalRounds: 2,
      instructions: "Feet shoulder-width, chest up. Descend until thighs are parallel.",
      cues: ["Chest up", "Knees track toes", "Drive through heels"],
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    { id: "ca-rest-2a", type: "rest", phase: "circuit_a", duration: 20 },
    {
      id: "ca-2b", type: "work", phase: "circuit_a", duration: 40,
      exerciseName: "Jump Squat", round: 2, totalRounds: 2,
      instructions: "Lower into squat then explode upward. Land softly.",
      cues: ["Explode upward", "Land with soft knees", "Stay on the balls of your feet"],
      muscleGroups: ["Quads", "Glutes", "Calves"],
    },
    { id: "ca-rest-end", type: "rest", phase: "circuit_a", duration: 20 },

    // ── CIRCUIT B (4 min = 240s) ──────────────────────────
    { id: "cb-prep", type: "prepare", phase: "circuit_b", duration: 5,
      exerciseName: "Circuit B — Primary", instructions: "2 rounds. No surrender." },
    // Round 1
    {
      id: "cb-1a", type: "work", phase: "circuit_b", duration: 40,
      exerciseName: "Forward Lunge", round: 1, totalRounds: 2,
      instructions: "Step forward, lower back knee toward floor. Alternate legs.",
      cues: ["Long step", "Front knee over ankle", "Push back to start"],
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    { id: "cb-rest-1a", type: "rest", phase: "circuit_b", duration: 20 },
    {
      id: "cb-1b", type: "work", phase: "circuit_b", duration: 40,
      exerciseName: "Reverse Lunge", round: 1, totalRounds: 2,
      instructions: "Step backward, lower back knee. Alternate legs.",
      cues: ["Core tight", "Drive front heel", "Controlled tempo"],
      muscleGroups: ["Glutes", "Quads", "Hip Flexors"],
    },
    { id: "cb-rest-1b", type: "rest", phase: "circuit_b", duration: 20 },
    // Round 2
    {
      id: "cb-2a", type: "work", phase: "circuit_b", duration: 40,
      exerciseName: "Forward Lunge", round: 2, totalRounds: 2,
      instructions: "Step forward, lower back knee toward floor. Alternate legs.",
      cues: ["Long step", "Front knee over ankle", "Push back to start"],
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    { id: "cb-rest-2a", type: "rest", phase: "circuit_b", duration: 20 },
    {
      id: "cb-2b", type: "work", phase: "circuit_b", duration: 40,
      exerciseName: "Reverse Lunge", round: 2, totalRounds: 2,
      instructions: "Step backward, lower back knee. Alternate legs.",
      cues: ["Core tight", "Drive front heel", "Controlled tempo"],
      muscleGroups: ["Glutes", "Quads", "Hip Flexors"],
    },
    { id: "cb-rest-end", type: "rest", phase: "circuit_b", duration: 15 },

    // ── FINISHER (3 min = 180s) ───────────────────────────
    { id: "fin-prep", type: "prepare", phase: "finisher", duration: 5,
      exerciseName: "FINISHER", instructions: "Max effort. Leave nothing." },
    {
      id: "fin-1", type: "work", phase: "finisher", duration: 170,
      exerciseName: "Wall Sit",
      instructions: "Back flat against wall, thighs parallel to floor. Hold until the timer ends.",
      cues: ["Back flat on wall", "Thighs parallel", "Hold. Do. Not. Move."],
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    },
    { id: "fin-rest", type: "rest", phase: "finisher", duration: 5 },

    // ── DECOMPRESSION (2 min = 120s) ─────────────────────
    { id: "dec-prep", type: "prepare", phase: "decompression", duration: 5,
      exerciseName: "Decompression", instructions: "Slow down. You earned this." },
    {
      id: "dec-1", type: "work", phase: "decompression", duration: 55,
      exerciseName: "Hip Flexor Stretch",
      instructions: "Kneeling lunge position. Drive hips forward. Hold each side.",
      cues: ["Deep breath in", "Relax on exhale", "Hold the stretch"],
      muscleGroups: ["Hip Flexors", "Quads"],
    },
    { id: "dec-rest", type: "rest", phase: "decompression", duration: 5 },
    {
      id: "dec-2", type: "work", phase: "decompression", duration: 55,
      exerciseName: "Quad Stretch",
      instructions: "Stand tall, pull heel to glute. Hold a wall for balance if needed.",
      cues: ["Tall posture", "Knees together", "Breathe deeply"],
      muscleGroups: ["Quads", "Hip Flexors"],
    },
  ],
};

/* Build a quick lookup: total duration */
export const WORKOUT_TOTAL_SECONDS = getTotalDuration(OPERATION_THUNDER.segments);

/* Phase display labels */
export const PHASE_LABELS: Record<PhaseType, string> = {
  activation:    "ACTIVATION",
  circuit_a:     "CIRCUIT A",
  circuit_b:     "CIRCUIT B",
  finisher:      "FINISHER",
  decompression: "DECOMPRESSION",
};

export const PHASE_COLORS: Record<PhaseType, string> = {
  activation:    "var(--intel-400)",
  circuit_a:     "var(--operative-400)",
  circuit_b:     "var(--operative-400)",
  finisher:      "var(--breach-400)",
  decompression: "var(--classified-400)",
};
