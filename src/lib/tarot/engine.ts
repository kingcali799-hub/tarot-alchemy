import { ALL_CARDS, type TarotCard } from "./cards";
import { DECKS } from "./decks";

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  positionLabel: string;
  positionMeaning: string;
  /** Which tradition this card came up in. */
  deckId: string;
  clarifier?: boolean;
  /** For clarifiers: the position label this card throws light on. */
  clarifies?: string;
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
  options: { allowReversals: boolean; majorsOnly?: boolean; deckId: string; clarifiers?: number },
): DrawnCard[] {
  const pool = options.majorsOnly ? ALL_CARDS.filter((c) => c.arcana === "major") : ALL_CARDS;
  const shuffled = shuffle(pool);
  const blended = options.deckId === "blend";
  // Clarifiers are dealt per dealt card: each position gets its own clarifier(s).
  const perCard = Math.max(0, options.clarifiers ?? 0);
  const slots: { label: string; meaning: string; clarifier: boolean; clarifies?: string }[] = [
    ...positions.map((position) => ({ ...position, clarifier: false })),
  ];
  for (const position of positions) {
    for (let i = 0; i < perCard; i++) {
      slots.push({
        label: perCard > 1 ? `Clarifier ${ROMAN_CLARIFIER[i] ?? i + 1} · ${position.label}` : `Clarifier · ${position.label}`,
        meaning: `Further light on "${position.label}" — ${position.meaning}`,
        clarifier: true,
        clarifies: position.label,
      });
    }
  }
  return slots.map((slot, index) => ({
    card: shuffled[index % shuffled.length]!,
    reversed: options.allowReversals ? randomInt(100) < 32 : false,
    positionLabel: slot.label,
    positionMeaning: slot.meaning,
    deckId: blended ? DECKS[randomInt(DECKS.length)]!.id : options.deckId,
    clarifier: slot.clarifier,
    ...(slot.clarifies ? { clarifies: slot.clarifies } : {}),
  }));
}

const ROMAN_CLARIFIER = ["I", "II", "III", "IV", "V"];

export function cardMeaning(drawn: DrawnCard): string {
  return drawn.reversed ? drawn.card.reversed : drawn.card.upright;
}

export function cardKeywords(drawn: DrawnCard): string[] {
  return drawn.reversed ? drawn.card.reversedKeywords : drawn.card.keywords;
}