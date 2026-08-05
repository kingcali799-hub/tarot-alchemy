import { ALL_CARDS, type TarotCard } from "./cards";

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  positionLabel: string;
  positionMeaning: string;
}

/** Fisher–Yates using crypto randomness when available. */
function shuffle<T>(items: T[]): T[] {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

function randomInt(max: number): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buffer);
    return buffer[0]! % max;
  }
  return Math.floor(Math.random() * max);
}

export function dealSpread(
  positions: { label: string; meaning: string }[],
  options: { allowReversals: boolean; majorsOnly?: boolean },
): DrawnCard[] {
  const pool = options.majorsOnly ? ALL_CARDS.filter((c) => c.arcana === "major") : ALL_CARDS;
  const shuffled = shuffle(pool);
  return positions.map((position, index) => ({
    card: shuffled[index % shuffled.length]!,
    reversed: options.allowReversals ? randomInt(100) < 32 : false,
    positionLabel: position.label,
    positionMeaning: position.meaning,
  }));
}

export function cardMeaning(drawn: DrawnCard): string {
  return drawn.reversed ? drawn.card.reversed : drawn.card.upright;
}

export function cardKeywords(drawn: DrawnCard): string[] {
  return drawn.reversed ? drawn.card.reversedKeywords : drawn.card.keywords;
}