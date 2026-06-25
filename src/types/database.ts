/* ============================================================
   Auto-generated Supabase database types.
   Run: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts
   to regenerate after schema changes.
   ============================================================ */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ranks: {
        Row: {
          id: number;
          rank_number: number;
          name: string;
          xp_required: number;
          insignia_color: string;
          description: string | null;
          unlocks: string[];
          created_at: string;
        };
        Insert: never;   // admin-seeded only
        Update: never;
      };

      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          weight_kg: number | null;
          height_cm: number | null;
          goal_weight_kg: number | null;
          date_of_birth: string | null;
          biological_sex: "male" | "female" | null;
          gender_identity: string | null;
          fitness_level: "recruit" | "soldier" | "veteran";
          primary_goal: "weight_loss" | "strength" | "endurance";
          assessment_pushups: number | null;
          assessment_squats: number | null;
          assessment_plank_sec: number | null;
          assessment_score: number | null;
          initial_difficulty: "t1" | "t2" | "t3" | "t4" | null;
          current_rank_id: number;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_workout_date: string | null;
          subscription_tier: "free" | "premium" | "elite";
          onboarding_complete: boolean;
          onboarding_step: number;
          rpm_avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          goal_weight_kg?: number | null;
          date_of_birth?: string | null;
          biological_sex?: "male" | "female" | null;
          gender_identity?: string | null;
          fitness_level?: "recruit" | "soldier" | "veteran";
          primary_goal?: "weight_loss" | "strength" | "endurance";
          assessment_pushups?: number | null;
          assessment_squats?: number | null;
          assessment_plank_sec?: number | null;
          assessment_score?: number | null;
          initial_difficulty?: "t1" | "t2" | "t3" | "t4" | null;
          current_rank_id?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_workout_date?: string | null;
          subscription_tier?: "free" | "premium" | "elite";
          onboarding_complete?: boolean;
          onboarding_step?: number;
          rpm_avatar_url?: string | null;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          goal_weight_kg?: number | null;
          date_of_birth?: string | null;
          biological_sex?: "male" | "female" | null;
          gender_identity?: string | null;
          fitness_level?: "recruit" | "soldier" | "veteran";
          primary_goal?: "weight_loss" | "strength" | "endurance";
          assessment_pushups?: number | null;
          assessment_squats?: number | null;
          assessment_plank_sec?: number | null;
          assessment_score?: number | null;
          initial_difficulty?: "t1" | "t2" | "t3" | "t4" | null;
          current_rank_id?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_workout_date?: string | null;
          subscription_tier?: "free" | "premium" | "elite";
          onboarding_complete?: boolean;
          onboarding_step?: number;
          rpm_avatar_url?: string | null;
        };
      };

      exercise_library: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: "push" | "pull" | "legs" | "core" | "cardio" | "mobility" | "compound";
          muscle_groups: string[];
          difficulty_tier: "t1" | "t2" | "t3" | "t4";
          default_duration_sec: number;
          default_rest_sec: number;
          default_sets: number;
          video_url: string | null;
          thumbnail_url: string | null;
          avatar_animation_url: string | null;
          instructions: string;
          cues: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };

      workouts: {
        Row: {
          id: string;
          title: string;
          operation_name: string;
          description: string | null;
          week_number: number | null;
          day_number: number | null;
          duration_seconds: number;
          difficulty: "t1" | "t2" | "t3" | "t4";
          workout_type: "push" | "pull" | "legs" | "core" | "cardio" | "compound" | "recovery";
          xp_reward: number;
          estimated_calories: number;
          tags: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };

      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          phase: "activation" | "circuit_a" | "circuit_b" | "finisher" | "decompression";
          position: number;
          sets: number | null;
          reps: number | null;
          duration_sec: number | null;
          rest_sec: number | null;
          notes: string | null;
        };
        Insert: never;
        Update: never;
      };

      session_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          started_at: string;
          completed_at: string | null;
          completion_pct: number;
          duration_actual_sec: number | null;
          xp_earned: number;
          calories_burned: number | null;
          avg_heart_rate: number | null;
          max_heart_rate: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          workout_id: string;
          started_at?: string;
          completed_at?: string | null;
          completion_pct?: number;
          duration_actual_sec?: number | null;
          xp_earned?: number;
          calories_burned?: number | null;
          avg_heart_rate?: number | null;
          max_heart_rate?: number | null;
          notes?: string | null;
        };
        Update: {
          completed_at?: string | null;
          completion_pct?: number;
          duration_actual_sec?: number | null;
          xp_earned?: number;
          calories_burned?: number | null;
          avg_heart_rate?: number | null;
          max_heart_rate?: number | null;
          notes?: string | null;
        };
      };

      exercise_progress: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          exercise_id: string;
          sets_completed: number;
          reps_completed: number | null;
          duration_sec: number | null;
          hold_sec: number | null;
          is_personal_record: boolean;
          difficulty_felt: "too_easy" | "just_right" | "too_hard" | null;
          recorded_at: string;
        };
        Insert: {
          user_id: string;
          session_id: string;
          exercise_id: string;
          sets_completed: number;
          reps_completed?: number | null;
          duration_sec?: number | null;
          hold_sec?: number | null;
          is_personal_record?: boolean;
          difficulty_felt?: "too_easy" | "just_right" | "too_hard" | null;
        };
        Update: {
          sets_completed?: number;
          reps_completed?: number | null;
          duration_sec?: number | null;
          hold_sec?: number | null;
          is_personal_record?: boolean;
          difficulty_felt?: "too_easy" | "just_right" | "too_hard" | null;
        };
      };

      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          source: string;
          description?: string | null;
          metadata?: Json;
        };
        Update: never;
      };

      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          badge_url: string | null;
          xp_bonus: number;
          rarity: "common" | "uncommon" | "rare" | "legendary";
          trigger_type: string;
          trigger_value: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };

      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
          notified: boolean;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          notified?: boolean;
        };
        Update: { notified?: boolean };
      };

      streak_shields: {
        Row: {
          id: string;
          user_id: string;
          granted_at: string;
          used_at: string | null;
          used_for_date: string | null;
          source: "milestone" | "premium" | "achievement";
        };
        Insert: {
          user_id: string;
          used_at?: string | null;
          used_for_date?: string | null;
          source?: "milestone" | "premium" | "achievement";
        };
        Update: {
          used_at?: string | null;
          used_for_date?: string | null;
        };
      };

      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          water_ml: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          water_ml?: number;
        };
        Update: {
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          water_ml?: number;
        };
      };

      meal_entries: {
        Row: {
          id: string;
          nutrition_log_id: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          food_name: string;
          brand: string | null;
          serving_size_g: number | null;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          barcode: string | null;
          logged_at: string;
        };
        Insert: {
          nutrition_log_id: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          food_name: string;
          brand?: string | null;
          serving_size_g?: number | null;
          calories: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          barcode?: string | null;
        };
        Update: {
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack";
          food_name?: string;
          brand?: string | null;
          serving_size_g?: number | null;
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
        };
      };

      body_metrics: {
        Row: {
          id: string;
          user_id: string;
          recorded_at: string;
          recorded_date: string;
          weight_kg: number;
          body_fat_pct: number | null;
          notes: string | null;
        };
        Insert: {
          user_id: string;
          weight_kg: number;
          body_fat_pct?: number | null;
          notes?: string | null;
          recorded_at?: string;
          recorded_date?: string;
        };
        Update: {
          weight_kg?: number;
          body_fat_pct?: number | null;
          notes?: string | null;
        };
      };
    };

    Views: {
      v_dashboard_summary: {
        Row: {
          user_id: string;
          display_name: string;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          current_rank_id: number;
          rank_name: string;
          rank_xp_required: number;
          next_rank_xp_required: number | null;
          next_rank_name: string | null;
          sessions_this_week: number;
          xp_this_week: number;
          calories_this_week: number;
          calories_today: number;
          water_ml_today: number;
          latest_weight_kg: number | null;
          goal_weight_kg: number | null;
          last_workout_date: string | null;
          onboarding_complete: boolean;
        };
      };
    };

    Functions: {
      award_session_xp: {
        Args: {
          p_session_id: string;
          p_user_id: string;
          p_completion_pct: number;
          p_duration_sec: number;
        };
        Returns: number;
      };
      update_streak: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      calculate_tdee: {
        Args: { p_user_id: string };
        Returns: Json;
      };
    };
  };
}

// Helper type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
