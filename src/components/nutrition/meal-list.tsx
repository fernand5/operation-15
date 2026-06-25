import { Plus } from "lucide-react";

interface MealEntry {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface MealListProps {
  entries: MealEntry[];
  onAddMeal: () => void;
}

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch:     "☀️",
  dinner:    "🌙",
  snack:     "🍎",
};

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

export function MealList({ entries, onAddMeal }: MealListProps) {
  const grouped = MEAL_ORDER.reduce<Record<string, MealEntry[]>>((acc, type) => {
    acc[type] = entries.filter((e) => e.meal_type === type);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-disabled)" }}>
          Meals Logged
        </p>
        <button
          onClick={onAddMeal}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors"
          style={{ color: "var(--operative-400)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Meal
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-6 rounded-[var(--radius-md)] border"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
          <p className="text-2xl mb-2">🍽️</p>
          <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            No rations logged
          </p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Fuel your mission — log your first meal.
          </p>
        </div>
      ) : (
        MEAL_ORDER.map((type) => {
          const typeEntries = grouped[type];
          if (typeEntries.length === 0) return null;
          const totalCal = typeEntries.reduce((a, e) => a + e.calories, 0);

          return (
            <div key={type} className="rounded-[var(--radius-md)] border overflow-hidden"
              style={{ borderColor: "var(--border-subtle)" }}>
              {/* Meal type header */}
              <div className="flex items-center justify-between px-4 py-2"
                style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: "var(--text-secondary)" }}>
                  {MEAL_EMOJI[type]} {type}
                </span>
                <span className="font-mono text-[12px] font-bold" style={{ color: "var(--operative-400)" }}>
                  {totalCal} kcal
                </span>
              </div>

              {/* Items */}
              {typeEntries.map((entry, i) => (
                <div key={entry.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom: i < typeEntries.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    background: "var(--bg-surface)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {entry.food_name}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      P: {entry.protein_g}g · C: {entry.carbs_g}g · F: {entry.fat_g}g
                    </p>
                  </div>
                  <p className="font-mono text-[13px] font-bold flex-shrink-0"
                    style={{ color: "var(--text-primary)" }}>
                    {entry.calories}
                    <span className="text-[10px] font-normal" style={{ color: "var(--text-disabled)" }}> kcal</span>
                  </p>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
