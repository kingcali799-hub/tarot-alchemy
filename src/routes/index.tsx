import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DECKS, getDeck } from "@/lib/tarot/decks";
import { SPREADS, SPREAD_CATEGORIES, getSpread } from "@/lib/tarot/spreads";
import { cardKeywords, cardMeaning, dealSpread, type DrawnCard } from "@/lib/tarot/engine";
import { ReadingCloth } from "@/components/tarot/ReadingCloth";
import { cardTitle } from "@/components/tarot/CardFace";
import { interpretReading, saveReading } from "@/lib/reading.functions";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ask the Oracle — Tarot Readings for Any Spread" },
      {
        name: "description",
        content:
          "Set an intention, choose from four traditional decks and every classic spread, and receive a woven tarot reading with full card meanings.",
      },
      { property: "og:title", content: "Ask the Oracle — Tarot Readings for Any Spread" },
      {
        property: "og:description",
        content: "Four decks, every classic spread, full card meanings and an interpreted reading.",
      },
    ],
  }),
  component: Index,
});

type Phase = "intention" | "shuffling" | "reading";

function Index() {
  const { user } = useSession();
  const [intention, setIntention] = useState("");
  const [deckId, setDeckId] = useState("rws");
  const [spreadId, setSpreadId] = useState("three-card");
  const [reversals, setReversals] = useState(true);
  const [majorsOnly, setMajorsOnly] = useState(false);
  const [phase, setPhase] = useState<Phase>("intention");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [interpreting, setInterpreting] = useState(false);
  const [saved, setSaved] = useState(false);

  const deck = getDeck(deckId);
  const spread = useMemo(() => getSpread(spreadId) ?? SPREADS[1]!, [spreadId]);
  const active = activeIndex !== null ? drawn[activeIndex] : undefined;

  function deal() {
    const cards = dealSpread(spread.positions, { allowReversals: reversals, majorsOnly });
    setDrawn(cards);
    setRevealed(0);
    setActiveIndex(null);
    setInterpretation("");
    setSaved(false);
    setPhase("shuffling");
    window.setTimeout(() => {
      setPhase("reading");
      let index = 0;
      const timer = window.setInterval(() => {
        index += 1;
        setRevealed(index);
        if (index >= cards.length) window.clearInterval(timer);
      }, 260);
    }, 900);
  }

  async function askOracle() {
    if (!drawn.length) return;
    setInterpreting(true);
    try {
      const result = await interpretReading({
        data: {
          intention,
          deckName: deck.name,
          deckTradition: deck.tradition,
          spreadName: spread.name,
          cards: drawn.map((d) => ({
            name: cardTitle(d.card, deck),
            reversed: d.reversed,
            positionLabel: d.positionLabel,
            positionMeaning: d.positionMeaning,
            keywords: cardKeywords(d),
            meaning: cardMeaning(d),
          })),
        },
      });
      setInterpretation(result.interpretation);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The oracle could not speak.");
    } finally {
      setInterpreting(false);
    }
  }

  async function keepReading() {
    if (!user) {
      toast.error("Sign in to keep readings in your journal.");
      return;
    }
    try {
      await saveReading({
        data: {
          intention,
          deckId,
          spreadId,
          spreadName: spread.name,
          cards: drawn.map((d) => ({
            name: cardTitle(d.card, deck),
            reversed: d.reversed,
            positionLabel: d.positionLabel,
            positionMeaning: d.positionMeaning,
            keywords: cardKeywords(d),
            meaning: cardMeaning(d),
          })),
          interpretation: interpretation || null,
        },
      });
      setSaved(true);
      toast.success("Kept in your journal.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the reading.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold-soft">The Oracle</p>
        <h1 className="mt-4 text-4xl leading-tight text-foreground sm:text-5xl">
          Ask, and let the cards <span className="text-gradient-gold italic">answer</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Name what you need clarity on. Choose your deck and spread, or draw blind. Every card is
          read in its position, upright or reversed.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5 rounded-lg border border-gold/15 bg-card/60 p-5">
          <div>
            <label htmlFor="intention" className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
              Your intention
            </label>
            <textarea
              id="intention"
              value={intention}
              maxLength={600}
              onChange={(event) => setIntention(event.target.value)}
              rows={3}
              placeholder="What do you need clarity on?"
              className="mt-2 w-full resize-none rounded-md border border-input bg-background/60 p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-gold/60"
            />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">Deck</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {DECKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDeckId(item.id)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    deckId === item.id
                      ? "border-gold/70 bg-secondary text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:border-gold/40",
                  )}
                >
                  <span className="text-base">{item.glyph}</span>
                  <span className="mt-1 block text-xs leading-tight">{item.name}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{deck.description}</p>
          </div>

          <div>
            <label htmlFor="spread" className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
              Spread
            </label>
            <select
              id="spread"
              value={spreadId}
              onChange={(event) => setSpreadId(event.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background/60 p-2.5 text-sm text-foreground outline-none focus:border-gold/60"
            >
              {SPREAD_CATEGORIES.map((category) => (
                <optgroup key={category.id} label={category.label}>
                  {SPREADS.filter((item) => item.category === category.id).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.positions.length} cards
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{spread.bestFor}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reversals}
                onChange={(event) => setReversals(event.target.checked)}
                className="accent-[oklch(0.78_0.12_85)]"
              />
              Allow reversals
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={majorsOnly}
                onChange={(event) => setMajorsOnly(event.target.checked)}
                className="accent-[oklch(0.78_0.12_85)]"
              />
              Major arcana only
            </label>
          </div>

          <button
            type="button"
            onClick={deal}
            className="w-full rounded-md bg-[image:var(--gradient-gold)] px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            {phase === "intention" ? "Shuffle & deal" : "Draw again"}
          </button>
          <Link to="/spreads" className="block text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
            Browse all spreads
          </Link>
        </div>

        <div className="space-y-5">
          {phase === "intention" ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-gold/20 p-10 text-center">
              <span className="text-gradient-gold animate-float text-5xl">{deck.glyph}</span>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                The {spread.name} spread lays {spread.positions.length}{" "}
                {spread.positions.length === 1 ? "card" : "cards"}. When you are ready, shuffle.
              </p>
            </div>
          ) : phase === "shuffling" ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-lg border border-gold/20 p-10 text-center">
              <span className="text-gradient-gold animate-float text-5xl">{deck.glyph}</span>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Shuffling…</p>
            </div>
          ) : (
            <>
              <ReadingCloth
                positions={spread.positions}
                drawn={drawn}
                deck={deck}
                revealed={revealed}
                activeIndex={activeIndex}
                onSelect={(index) => setActiveIndex(index === activeIndex ? null : index)}
              />

              {active ? (
                <div className="rounded-lg border border-gold/25 bg-card/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
                    {active.positionLabel} — {active.positionMeaning}
                  </p>
                  <h2 className="mt-2 text-2xl text-foreground">
                    {cardTitle(active.card, deck)}
                    {active.reversed ? <span className="text-base text-ember"> · reversed</span> : null}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {cardKeywords(active).join(" · ")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{cardMeaning(active)}</p>
                </div>
              ) : (
                <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Tap a card to read its meaning
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={askOracle}
                  disabled={interpreting || revealed < drawn.length}
                  className="rounded-md border border-gold/60 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-secondary disabled:opacity-40"
                >
                  {interpreting ? "The oracle is speaking…" : "Read the whole spread"}
                </button>
                <button
                  type="button"
                  onClick={keepReading}
                  disabled={saved || revealed < drawn.length}
                  className="rounded-md border border-border px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-40"
                >
                  {saved ? "Kept" : "Keep in journal"}
                </button>
              </div>

              {interpretation ? (
                <article className="rounded-lg border border-gold/25 bg-veil/50 p-6">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold-soft">The reading</p>
                  <div className="mt-3 space-y-4 font-display text-[17px] leading-relaxed text-foreground/95">
                    {interpretation.split(/\n{1,}/).filter(Boolean).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
