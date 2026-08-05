import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ALL_CARDS, SUITS, type TarotCard } from "@/lib/tarot/cards";
import { DECKS, getDeck } from "@/lib/tarot/decks";
import { CardFace, cardTitle } from "@/components/tarot/CardFace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Tarot Card Meanings — All 78 Cards | Oracle" },
      {
        name: "description",
        content:
          "Upright and reversed meanings for all 78 tarot cards, with keywords, element and astrology, across the Rider–Waite–Smith, Egyptian, Thoth and Isis decks.",
      },
      { property: "og:title", content: "Tarot Card Meanings — All 78 Cards" },
      { property: "og:description", content: "Upright and reversed meanings for the full deck." },
    ],
  }),
  component: CardsPage,
});

const FILTERS = [
  { id: "all", label: "All 78" },
  { id: "major", label: "Major arcana" },
  { id: "wands", label: "Wands" },
  { id: "cups", label: "Cups" },
  { id: "swords", label: "Swords" },
  { id: "pentacles", label: "Pentacles" },
];

function CardsPage() {
  const [deckId, setDeckId] = useState("rws");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TarotCard | null>(null);
  const deck = getDeck(deckId);

  const cards = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ALL_CARDS.filter((card) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "major" && card.arcana === "major") ||
        card.suit === filter;
      const matchesQuery =
        !term ||
        card.name.toLowerCase().includes(term) ||
        card.keywords.some((keyword) => keyword.includes(term));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl text-foreground">Card meanings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        All 78 cards, upright and reversed. Switch decks to see each card under its traditional
        title — {DECKS.map((item) => item.name).join(", ")}.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {DECKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDeckId(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors",
              deckId === item.id ? "border-gold/70 text-gold" : "border-border text-muted-foreground hover:border-gold/40",
            )}
          >
            {item.glyph} {item.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors",
              filter === item.id ? "border-gold/70 text-gold" : "border-border text-muted-foreground hover:border-gold/40",
            )}
          >
            {item.id === "all" || item.id === "major" ? item.label : deck.suitLabels[item.id] ?? item.label}
          </button>
        ))}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search cards or keywords…"
          className="ml-auto w-56 rounded-md border border-input bg-background/60 px-3 py-1.5 text-sm outline-none focus:border-gold/60"
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {cards.map((card) => (
          <CardFace
            key={card.id}
            card={card}
            deck={deck}
            selected={selected?.id === card.id}
            onClick={() => setSelected(card)}
          />
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-popover/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl gap-5 px-4 py-5">
            <div className="hidden w-24 shrink-0 sm:block">
              <CardFace card={selected} deck={deck} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl text-foreground">{cardTitle(selected, deck)}</h2>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {selected.arcana === "major"
                      ? `Major arcana · ${selected.element}${selected.astrology ? ` · ${selected.astrology}` : ""}`
                      : `${SUITS[selected.suit!].label} · ${selected.element} · ${SUITS[selected.suit!].domain}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">Upright</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {selected.keywords.join(" · ")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{selected.upright}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ember">Reversed</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {selected.reversedKeywords.join(" · ")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{selected.reversed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}