export interface SpreadPosition {
  label: string;
  meaning: string;
  /** Percentage coordinates on the reading cloth (0-100). */
  x: number;
  y: number;
  rotated?: boolean;
}

export interface Spread {
  id: string;
  name: string;
  category: "quick" | "classic" | "relationship" | "deep" | "timing";
  summary: string;
  bestFor: string;
  positions: SpreadPosition[];
}

export const SPREADS: Spread[] = [
  {
    id: "one-card",
    name: "Single Card",
    category: "quick",
    summary: "One card, one truth. The daily draw.",
    bestFor: "A focus for the day or a direct answer to a narrow question.",
    positions: [{ label: "The Message", meaning: "The single truth being offered right now.", x: 50, y: 50 }],
  },
  {
    id: "three-card",
    name: "Past · Present · Future",
    category: "quick",
    summary: "The classic three-card timeline.",
    bestFor: "Understanding how a situation arrived and where it is heading.",
    positions: [
      { label: "Past", meaning: "What shaped this situation.", x: 22, y: 50 },
      { label: "Present", meaning: "Where you stand now.", x: 50, y: 50 },
      { label: "Future", meaning: "Where the current course leads.", x: 78, y: 50 },
    ],
  },
  {
    id: "situation-action-outcome",
    name: "Situation · Action · Outcome",
    category: "quick",
    summary: "Three cards aimed at a decision.",
    bestFor: "When you need to know what to actually do.",
    positions: [
      { label: "Situation", meaning: "The true shape of what you are in.", x: 22, y: 50 },
      { label: "Action", meaning: "The move being asked of you.", x: 50, y: 50 },
      { label: "Outcome", meaning: "What follows from taking it.", x: 78, y: 50 },
    ],
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    category: "classic",
    summary: "The ten-card master spread for a full situation.",
    bestFor: "Complex questions that deserve a complete picture.",
    positions: [
      { label: "The Heart", meaning: "The core of the matter.", x: 30, y: 48 },
      { label: "The Crossing", meaning: "What opposes or complicates it.", x: 30, y: 48, rotated: true },
      { label: "The Foundation", meaning: "The root beneath the situation.", x: 30, y: 78 },
      { label: "The Recent Past", meaning: "What is passing away.", x: 12, y: 48 },
      { label: "The Crown", meaning: "Your conscious aim or best possible outcome.", x: 30, y: 18 },
      { label: "The Near Future", meaning: "What approaches next.", x: 48, y: 48 },
      { label: "Yourself", meaning: "How you are showing up in it.", x: 74, y: 82 },
      { label: "Environment", meaning: "Other people and outside forces.", x: 74, y: 60 },
      { label: "Hopes & Fears", meaning: "What you long for and dread — often the same thing.", x: 74, y: 38 },
      { label: "The Outcome", meaning: "Where this resolves.", x: 74, y: 16 },
    ],
  },
  {
    id: "horseshoe",
    name: "Horseshoe",
    category: "classic",
    summary: "Seven cards arcing from past to outcome.",
    bestFor: "A broad read with practical advice built in.",
    positions: [
      { label: "Past", meaning: "What led here.", x: 10, y: 70 },
      { label: "Present", meaning: "The current condition.", x: 22, y: 42 },
      { label: "Hidden Influences", meaning: "What you cannot yet see.", x: 36, y: 22 },
      { label: "Obstacle", meaning: "What stands in the way.", x: 50, y: 14 },
      { label: "Others", meaning: "The attitudes of people around you.", x: 64, y: 22 },
      { label: "Advice", meaning: "The wisest course.", x: 78, y: 42 },
      { label: "Outcome", meaning: "Most likely resolution.", x: 90, y: 70 },
    ],
  },
  {
    id: "relationship-cross",
    name: "Relationship Cross",
    category: "relationship",
    summary: "Seven cards on the space between two people.",
    bestFor: "Romance, friendship, family or a working partnership.",
    positions: [
      { label: "You", meaning: "Your part in the bond.", x: 20, y: 40 },
      { label: "Them", meaning: "Their part in the bond.", x: 80, y: 40 },
      { label: "The Bond", meaning: "What actually connects you.", x: 50, y: 25 },
      { label: "Strength", meaning: "What holds it together.", x: 50, y: 55 },
      { label: "Challenge", meaning: "What strains it.", x: 50, y: 80 },
      { label: "What They Need", meaning: "Unspoken from their side.", x: 80, y: 72 },
      { label: "What You Need", meaning: "Unspoken from yours.", x: 20, y: 72 },
    ],
  },
  {
    id: "should-i",
    name: "Should I? — Two Paths",
    category: "relationship",
    summary: "Six cards weighing two roads.",
    bestFor: "Stay or go, take it or leave it, yes or no.",
    positions: [
      { label: "The Question", meaning: "What is truly being asked.", x: 50, y: 15 },
      { label: "Path A · Now", meaning: "Immediate effect of the first choice.", x: 25, y: 45 },
      { label: "Path A · Later", meaning: "Where the first choice leads.", x: 25, y: 78 },
      { label: "Path B · Now", meaning: "Immediate effect of the second choice.", x: 75, y: 45 },
      { label: "Path B · Later", meaning: "Where the second choice leads.", x: 75, y: 78 },
      { label: "Unseen Factor", meaning: "What you have not accounted for.", x: 50, y: 60 },
    ],
  },
  {
    id: "shadow-work",
    name: "Shadow Work",
    category: "deep",
    summary: "Five cards into what you avoid.",
    bestFor: "Patterns, self-sabotage and repeating stories.",
    positions: [
      { label: "The Mask", meaning: "What you show the world.", x: 50, y: 14 },
      { label: "The Shadow", meaning: "What lives underneath.", x: 50, y: 44 },
      { label: "The Origin", meaning: "Where it was learned.", x: 22, y: 72 },
      { label: "The Cost", meaning: "What it takes from you.", x: 78, y: 72 },
      { label: "The Integration", meaning: "How to make peace with it.", x: 50, y: 88 },
    ],
  },
  {
    id: "tree-of-life",
    name: "Tree of Life",
    category: "deep",
    summary: "Ten cards on the Kabbalistic sephiroth.",
    bestFor: "A soul-level survey of a whole life season.",
    positions: [
      { label: "Kether · Purpose", meaning: "Highest intention.", x: 50, y: 6 },
      { label: "Chokmah · Wisdom", meaning: "Creative force at work.", x: 72, y: 20 },
      { label: "Binah · Understanding", meaning: "The form it must take.", x: 28, y: 20 },
      { label: "Chesed · Mercy", meaning: "Where you are generous.", x: 72, y: 38 },
      { label: "Geburah · Severity", meaning: "Where you must cut.", x: 28, y: 38 },
      { label: "Tiphareth · Beauty", meaning: "The heart of the matter.", x: 50, y: 50 },
      { label: "Netzach · Desire", meaning: "What you long for.", x: 72, y: 66 },
      { label: "Hod · Intellect", meaning: "How you think about it.", x: 28, y: 66 },
      { label: "Yesod · Foundation", meaning: "The subconscious base.", x: 50, y: 78 },
      { label: "Malkuth · Manifestation", meaning: "How it lands in your life.", x: 50, y: 92 },
    ],
  },
  {
    id: "chakra",
    name: "Chakra Line",
    category: "deep",
    summary: "Seven cards up the body's energy centres.",
    bestFor: "Health, energy and where you are blocked.",
    positions: [
      { label: "Crown", meaning: "Connection and meaning.", x: 50, y: 8 },
      { label: "Third Eye", meaning: "Insight and intuition.", x: 50, y: 22 },
      { label: "Throat", meaning: "Voice and truth-telling.", x: 50, y: 36 },
      { label: "Heart", meaning: "Love, grief and openness.", x: 50, y: 50 },
      { label: "Solar Plexus", meaning: "Will and self-worth.", x: 50, y: 64 },
      { label: "Sacral", meaning: "Desire and creativity.", x: 50, y: 78 },
      { label: "Root", meaning: "Safety and survival.", x: 50, y: 92 },
    ],
  },
  {
    id: "year-ahead",
    name: "Wheel of the Year",
    category: "timing",
    summary: "Twelve cards, one per month ahead.",
    bestFor: "Birthdays, new years and long-range planning.",
    positions: Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
      return {
        label: `Month ${index + 1}`,
        meaning: `The theme of month ${index + 1} from now.`,
        x: Math.round(50 + Math.cos(angle) * 38),
        y: Math.round(50 + Math.sin(angle) * 40),
      };
    }),
  },
  {
    id: "week-ahead",
    name: "Week Ahead",
    category: "timing",
    summary: "Seven cards, one per day.",
    bestFor: "Sunday-night planning and daily attunement.",
    positions: Array.from({ length: 7 }, (_, index) => ({
      label: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index]!,
      meaning: "The energy of the day.",
      x: 8 + index * 14,
      y: 50,
    })),
  },
];

export const SPREAD_CATEGORIES: { id: Spread["category"]; label: string }[] = [
  { id: "quick", label: "Quick draws" },
  { id: "classic", label: "Classic spreads" },
  { id: "relationship", label: "People & choices" },
  { id: "deep", label: "Deep work" },
  { id: "timing", label: "Timing" },
];

export function getSpread(id: string): Spread | undefined {
  return SPREADS.find((spread) => spread.id === id);
}