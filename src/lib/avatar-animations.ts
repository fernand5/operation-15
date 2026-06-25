/* ============================================================
   OPERATION 15 — Avatar Animation Configuration
   Maps exercise names to Mixamo animation GLB URLs.

   To add real animations:
   1. Download from mixamo.com (search by exercise name)
   2. Export as GLB, In Place checked, 30fps
   3. Host on Supabase Storage or Cloudflare R2
   4. Replace the placeholder URLs below
   ============================================================ */

export interface AnimationConfig {
  name: string;
  url: string | null;   // null = use idle fallback
  loopMode: "repeat" | "once";
  timeScale: number;    // speed multiplier (0.5 = slow, 1 = normal, 1.5 = fast)
}

// Default RPM avatar — public demo model
// Replace with user's own avatar URL from profiles.rpm_avatar_url
export const DEFAULT_AVATAR_URL =
  "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb";

// Mixamo animation map — keyed by exercise name (lowercase)
// URLs should point to hosted GLB files with Mixamo animation baked in
export const EXERCISE_ANIMATIONS: Record<string, AnimationConfig> = {
  "glute bridge": {
    name: "Glute Bridge",
    url: null, // placeholder — host a mixamo "Sit Up" or "Bridge" animation
    loopMode: "repeat",
    timeScale: 0.8,
  },
  "hip circles": {
    name: "Hip Circles",
    url: null,
    loopMode: "repeat",
    timeScale: 1.0,
  },
  "squat": {
    name: "Squat",
    url: null, // mixamo "Squat" animation
    loopMode: "repeat",
    timeScale: 1.0,
  },
  "jump squat": {
    name: "Jump Squat",
    url: null, // mixamo "Jump Squat" animation
    loopMode: "repeat",
    timeScale: 1.2,
  },
  "forward lunge": {
    name: "Forward Lunge",
    url: null, // mixamo "Lunges" animation
    loopMode: "repeat",
    timeScale: 1.0,
  },
  "reverse lunge": {
    name: "Reverse Lunge",
    url: null,
    loopMode: "repeat",
    timeScale: 1.0,
  },
  "wall sit": {
    name: "Wall Sit",
    url: null,
    loopMode: "once",
    timeScale: 0.5,
  },
  "hip flexor stretch": {
    name: "Hip Flexor Stretch",
    url: null,
    loopMode: "once",
    timeScale: 0.3,
  },
  "quad stretch": {
    name: "Quad Stretch",
    url: null,
    loopMode: "once",
    timeScale: 0.3,
  },
  // Fallback
  default: {
    name: "Idle",
    url: null,
    loopMode: "repeat",
    timeScale: 1.0,
  },
};

export function getAnimationForExercise(exerciseName: string): AnimationConfig {
  const key = exerciseName.toLowerCase();
  return EXERCISE_ANIMATIONS[key] ?? EXERCISE_ANIMATIONS.default;
}

// Camera preset positions per phase
export type CameraPreset = "front" | "side" | "overhead" | "close";

export const PHASE_CAMERA_PRESETS: Record<string, CameraPreset> = {
  activation:    "side",
  circuit_a:     "front",
  circuit_b:     "front",
  finisher:      "side",
  decompression: "front",
};
