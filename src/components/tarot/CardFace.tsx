import { cn } from "@/lib/utils";
import type { TarotCard } from "@/lib/tarot/cards";
import type { Deck } from "@/lib/tarot/decks";

const ROMAN = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
  "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
];

const SUIT_GLYPH: Record<string, string> = {
  wands: "🜂",
  cups: "🜄",
  swords: "🜁",
  pentacles: "🜃",
};

export function cardTitle(card: TarotCard, deck: Deck) {
  if (card.arcana === "major") return card.altNames?.[deck.id] ?? card.name;
  if (!card.suit) return card.name;
  const rank = card.name.split(" of ")[0]!;
  return `${rank} of ${deck.suitLabels[card.suit] ?? card.name.split(" of ")[1]}`;
}

interface Props {
  card: TarotCard;
  deck: Deck;
  reversed?: boolean;
  faceDown?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function CardFace({ card, deck, reversed, faceDown, className, onClick, selected }: Props) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cn(
        "group relative aspect-[2/3] w-full overflow-hidden rounded-md border text-left transition-all duration-500",
        faceDown
          ? "card-back border-gold/25"
          : "border-gold/40 bg-card shadow-[0_18px_44px_-24px_oklch(0.05_0.05_285/0.9)]",
        selected && "ring-1 ring-gold glow",
        onClick && "hover:-translate-y-1 hover:border-gold/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold",
        className,
      )}
    >
      {faceDown ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-[86%] w-[86%] items-center justify-center rounded-sm border border-gold/25">
            <span className="text-gradient-gold text-3xl">{deck.glyph}</span>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col justify-between p-2.5 transition-transform duration-500",
            reversed && "rotate-180",
          )}
        >
          <div className="flex items-start justify-between text-[10px] uppercase tracking-[0.18em] text-gold-soft">
            <span>{card.arcana === "major" ? ROMAN[card.number] : card.number <= 10 ? card.number : "•"}</span>
            <span>{card.suit ? SUIT_GLYPH[card.suit] : deck.glyph}</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-1 text-center">
            <span className="text-gradient-gold text-2xl leading-none">{card.suit ? SUIT_GLYPH[card.suit] : deck.glyph}</span>
            <span className="font-display text-[15px] leading-tight text-foreground">{cardTitle(card, deck)}</span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {(reversed ? card.reversedKeywords : card.keywords)[0]}
            </span>
          </div>
          <div className="text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {reversed ? "reversed" : card.element}
          </div>
        </div>
      )}
    </Wrapper>
  );
}