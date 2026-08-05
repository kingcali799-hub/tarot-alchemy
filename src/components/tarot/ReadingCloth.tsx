import { CardFace } from "./CardFace";
import type { DrawnCard } from "@/lib/tarot/engine";
import type { Deck } from "@/lib/tarot/decks";
import type { SpreadPosition } from "@/lib/tarot/spreads";
import { cn } from "@/lib/utils";

interface Props {
  positions: SpreadPosition[];
  drawn: DrawnCard[];
  deck: Deck;
  revealed: number;
  activeIndex: number | null;
  onSelect: (index: number) => void;
}

export function ReadingCloth({ positions, drawn, deck, revealed, activeIndex, onSelect }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-gold/15 bg-veil/40 p-3">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_50%_35%,oklch(0.4_0.09_300/0.35),transparent_65%)]" />
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
        {positions.map((position, index) => {
          const card = drawn[index];
          const isRevealed = index < revealed;
          return (
            <div
              key={`${position.label}-${index}`}
              className="absolute w-[15%] min-w-14 max-w-28 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div className={cn(position.rotated && "rotate-90")}>
                {card ? (
                  <CardFace
                    card={card.card}
                    deck={deck}
                    reversed={card.reversed}
                    faceDown={!isRevealed}
                    selected={activeIndex === index}
                    onClick={() => onSelect(index)}
                  />
                ) : (
                  <div className="aspect-[2/3] w-full rounded-md border border-dashed border-gold/25" />
                )}
              </div>
              <p className="mt-1 truncate text-center text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {position.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}