export interface Deck {
  id: string;
  name: string;
  tradition: string;
  description: string;
  /** Symbol used on the card back. */
  glyph: string;
  suitLabels: Record<string, string>;
}

export const DECKS: Deck[] = [
  {
    id: "rws",
    name: "Rider–Waite–Smith",
    tradition: "Golden Dawn / English",
    description:
      "The 1909 deck by Pamela Colman Smith and A. E. Waite. Fully illustrated pips and the vocabulary most modern meanings are written against.",
    glyph: "✶",
    suitLabels: { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" },
  },
  {
    id: "egyptian",
    name: "Egyptian Tarot",
    tradition: "Book of Thoth / Kier lineage",
    description:
      "The Egyptian tradition, with hieratic imagery, Hebrew-letter attributions and Spanish titles. Reads more oracular and fate-oriented than the RWS.",
    glyph: "𓂀",
    suitLabels: { wands: "Sceptres", cups: "Chalices", swords: "Swords", pentacles: "Coins" },
  },
  {
    id: "thoth",
    name: "Thoth Tarot",
    tradition: "Crowley & Harris",
    description:
      "Aleister Crowley and Lady Frieda Harris's esoteric deck. Retitled trumps (Lust, Adjustment, Art, The Aeon) and Kabbalistic, astrological pips.",
    glyph: "☤",
    suitLabels: { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Disks" },
  },
  {
    id: "isis",
    name: "Isis Oracle",
    tradition: "Isis-Urania / temple oracle",
    description:
      "A temple-oracle reading of the trumps through the Isis mysteries — veiling, weighing and rebirth. Gentle, ritual, initiation-focused voice.",
    glyph: "☥",
    suitLabels: { wands: "Flames", cups: "Vessels", swords: "Blades", pentacles: "Stones" },
  },
];

export function getDeck(id: string): Deck {
  if (id === BLENDED_DECK.id) return BLENDED_DECK;
  return DECKS.find((deck) => deck.id === id) ?? DECKS[0]!;
}

/** Pseudo-deck: every card is drawn from all traditions at once. */
export const BLENDED_DECK: Deck = {
  id: "blend",
  name: "The Blended Deck",
  tradition: "All four traditions shuffled together",
  description:
    "Rider–Waite–Smith, Egyptian, Thoth and Isis shuffled into a single pile. Each card arrives in whichever tradition wants to speak, and is read in that voice.",
  glyph: "✺",
  suitLabels: { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" },
};

export const DECK_OPTIONS: Deck[] = [BLENDED_DECK, ...DECKS];