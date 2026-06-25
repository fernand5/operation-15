/* ── Ranks ──────────────────────────────────────────────── */
export type RankName =
  | "Recruit"
  | "Private"
  | "Corporal"
  | "Sergeant"
  | "Lieutenant"
  | "Captain"
  | "Major"
  | "Colonel";

export interface Rank {
  id: number;
  name: RankName;
  xpRequired: number;
  insigniaColor: string;
  unlocks: string[];
}

/* ── User / Profile ──────────────────────────────────────── */
export type FitnessLevel = "recruit" | "soldier" | "veteran";
export type PrimaryGoal = "weight_loss" | "strength" | "endurance";
export type BiologicalSex = "male" | "female";
export type SubscriptionTier = "free" | "premium" | "elite";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  weightKg: number | null;
  heightCm: number | null;
  dateOfBirth: string | null;
  biologicalSex: BiologicalSex | null;
  genderIdentity: string | null;
  fitnessLevel: FitnessLevel;
  primaryGoal: PrimaryGoal;
  currentRankId: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  subscriptionTier: SubscriptionTier;
  onboardingComplete: boolean;
  createdAt: string;
  lastActiveAt: string | null;
}

/* ── Workouts ────────────────────────────────────────────── */
export type ExerciseCategory =
  | "push"
  | "pull"
  | "legs"
  | "core"
  | "cardio"
  | "mobility"
  | "compound";

export type DifficultyTier = "t1" | "t2" | "t3" | "t4";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  difficultyTier: DifficultyTier;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  avatarAnimationUrl: string | null;
  instructions: string;
  durationSec: number;
  restSec: number;
  sets: number;
}

export interface WorkoutPhase {
  name: "activation" | "circuit_a" | "circuit_b" | "finisher" | "decompression";
  durationSec: number;
  exercises: Exercise[];
  rounds: number;
}

export interface Workout {
  id: string;
  title: string;
  operationName: string;
  durationSeconds: number;
  difficulty: DifficultyTier;
  xpReward: number;
  estimatedCalories: number;
  tags: string[];
  weekNumber: number;
  dayNumber: number;
  phases: WorkoutPhase[];
}

/* ── Session ─────────────────────────────────────────────── */
export interface SessionLog {
  id: string;
  userId: string;
  workoutId: string;
  startedAt: string;
  completedAt: string | null;
  completionPct: number;
  xpEarned: number;
  caloriesBurned: number | null;
  notes: string | null;
}

/* ── Gamification ────────────────────────────────────────── */
export type AchievementCategory =
  | "mission"
  | "strength"
  | "streak"
  | "social"
  | "nutrition"
  | "rank"
  | "seasonal"
  | "elite";

export type AchievementRarity = "common" | "uncommon" | "rare" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  badgeUrl: string | null;
  xpBonus: number;
  rarity: AchievementRarity;
  earnedAt?: string;
}

/* ── Nutrition ───────────────────────────────────────────── */
export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

export interface BodyMetric {
  id: string;
  userId: string;
  recordedAt: string;
  weightKg: number;
  bodyFatPct: number | null;
  notes: string | null;
}

/* ── UI states ───────────────────────────────────────────── */
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiError {
  message: string;
  code?: string;
}
