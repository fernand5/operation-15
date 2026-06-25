export interface RankDefinition {
  id: number;
  name: string;
  xpRequired: number;
  insigniaColor: string;
  description: string;
  unlocks: string[];
  emoji: string;
}

export const RANKS: RankDefinition[] = [
  {
    id: 1, name: "Recruit",     xpRequired: 0,      insigniaColor: "#7A8FA8",
    emoji: "🪖", description: "Your mission begins. Zero excuses.",
    unlocks: ["Core workout library", "Nutrition tracker"],
  },
  {
    id: 2, name: "Private",     xpRequired: 500,    insigniaColor: "#A8BBCC",
    emoji: "⭐", description: "You showed up. Now stay.",
    unlocks: ["Streak Shield ×1", "Basic challenges"],
  },
  {
    id: 3, name: "Corporal",    xpRequired: 1200,   insigniaColor: "#00E676",
    emoji: "⭐⭐", description: "Discipline is forming.",
    unlocks: ["Squad creation", "Advanced workouts T2"],
  },
  {
    id: 4, name: "Sergeant",    xpRequired: 4000,   insigniaColor: "#FFB300",
    emoji: "🪖⭐", description: "You lead by example.",
    unlocks: ["Squad challenges", "Weekly reports"],
  },
  {
    id: 5, name: "Lieutenant",  xpRequired: 10000,  insigniaColor: "#5393FF",
    emoji: "🎖️", description: "Command is earned, not given.",
    unlocks: ["Lead squad of 10", "Challenge creation"],
  },
  {
    id: 6, name: "Captain",     xpRequired: 25000,  insigniaColor: "#2979FF",
    emoji: "🎖️⭐", description: "Your unit depends on you.",
    unlocks: ["Mentor badge", "Beta features"],
  },
  {
    id: 7, name: "Major",       xpRequired: 60000,  insigniaColor: "#BA52CC",
    emoji: "🏅", description: "The mission never sleeps.",
    unlocks: ["Exclusive content", "Founding member perks"],
  },
  {
    id: 8, name: "Colonel",     xpRequired: 120000, insigniaColor: "#F8FAFB",
    emoji: "🌟", description: "You are Operation 15.",
    unlocks: ["Lifetime premium", "Hall of Fame", "Physical medal"],
  },
];

export function getRankById(id: number): RankDefinition {
  return RANKS.find((r) => r.id === id) ?? RANKS[0];
}

export function getNextRank(currentId: number): RankDefinition | null {
  return RANKS.find((r) => r.id === currentId + 1) ?? null;
}

export function getXpProgress(totalXp: number, rankId: number) {
  const current = getRankById(rankId);
  const next = getNextRank(rankId);
  if (!next) return { pct: 100, xpIntoRank: 0, xpNeeded: 0 };
  const xpIntoRank = totalXp - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  const pct = Math.min(100, Math.round((xpIntoRank / xpNeeded) * 100));
  return { pct, xpIntoRank, xpNeeded };
}

export const ACHIEVEMENTS_MOCK = [
  { id: "1", name: "First Blood",        category: "mission",  rarity: "common",    earned: true,  emoji: "🎯", xpBonus: 50 },
  { id: "2", name: "Week One Done",      category: "streak",   rarity: "common",    earned: true,  emoji: "🔥", xpBonus: 50 },
  { id: "3", name: "10-Mission Patch",   category: "mission",  rarity: "common",    earned: false, emoji: "🏅", xpBonus: 100 },
  { id: "4", name: "Iron Fortnight",     category: "streak",   rarity: "common",    earned: false, emoji: "💪", xpBonus: 100 },
  { id: "5", name: "Promoted: Private",  category: "rank",     rarity: "common",    earned: true,  emoji: "⭐", xpBonus: 25 },
  { id: "6", name: "Hydration Hero",     category: "nutrition",rarity: "common",    earned: false, emoji: "💧", xpBonus: 75 },
  { id: "7", name: "50-Mission Medal",   category: "mission",  rarity: "uncommon",  earned: false, emoji: "🥈", xpBonus: 300 },
  { id: "8", name: "30-Day Commendation",category: "streak",   rarity: "uncommon",  earned: false, emoji: "📅", xpBonus: 300 },
  { id: "9", name: "Century Operator",   category: "mission",  rarity: "rare",      earned: false, emoji: "💯", xpBonus: 1000 },
  { id: "10","name": "Iron Will",        category: "streak",   rarity: "legendary", earned: false, emoji: "⚡", xpBonus: 1000 },
  { id: "11","name": "Perfect Month",    category: "elite",    rarity: "legendary", earned: false, emoji: "🌟", xpBonus: 2000 },
  { id: "12","name": "Macro Master",     category: "nutrition",rarity: "uncommon",  earned: false, emoji: "🥗", xpBonus: 150 },
];

export const XP_HISTORY_MOCK = [
  { id: "1", source: "session_complete",  amount: 100, description: "Operation Thunder complete", createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "2", source: "perfect_session",   amount: 25,  description: "Perfect completion bonus",   createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "3", source: "streak_milestone",  amount: 50,  description: "7-day streak milestone",      createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "4", source: "session_complete",  amount: 100, description: "Operation Push complete",    createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "5", source: "achievement",       amount: 50,  description: "First Blood achievement",    createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
];
