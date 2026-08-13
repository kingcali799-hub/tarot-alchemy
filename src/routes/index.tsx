import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DECK_OPTIONS, getDeck } from "@/lib/tarot/decks";
import { SPREADS, SPREAD_CATEGORIES, getSpread } from "@/lib/tarot/spreads";
import { loadCustomSpreads, type CustomSpread } from "@/lib/tarot/customSpreads";
import { cardKeywords, cardMeaning, dealSpread, type DrawnCard } from "@/lib/tarot/engine";
import { ReadingCloth } from "@/components/tarot/ReadingCloth";
import { CardFace, cardTitle } from "@/components/tarot/CardFace";
import { OracleOrb } from "@/components/tarot/OracleOrb";
import {
  getOracleContext,
  interpretReading,
  rememberReading,
  saveReading,
  speakReading,
} from "@/lib/reading.functions";
import { chunkNarration } from "@/lib/tarot/speech";
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
  const [deckId, setDeckId] = useState("blend");
  const [spreadId, setSpreadId] = useState("three-card");
  const [reversals, setReversals] = useState(true);
  const [majorsOnly, setMajorsOnly] = useState(false);
  const [useClarifiers, setUseClarifiers] = useState(false);
  const [clarifierCount, setClarifierCount] = useState(1);
  const [phase, setPhase] = useState<Phase>("intention");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [interpreting, setInterpreting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customSpreads, setCustomSpreads] = useState<CustomSpread[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRunRef = useRef(0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const sync = () => setCustomSpreads(loadCustomSpreads());
    sync();
    window.addEventListener("oracle:custom-spreads", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("oracle:custom-spreads", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const deck = getDeck(deckId);
  const spread = useMemo(
    () => getSpread(spreadId) ?? customSpreads.find((item) => item.id === spreadId) ?? SPREADS[1]!,
    [spreadId, customSpreads],
  );
  const active = activeIndex !== null ? drawn[activeIndex] : undefined;
  const spreadCards = drawn.filter((card) => !card.clarifier);
  const clarifierCards = drawn.filter((card) => card.clarifier);
  const clarifierGroups = useMemo(
    () =>
      spreadCards
        .map((parent, parentIndex) => ({
          parent,
          parentIndex,
          clarifiers: clarifierCards
            .map((card, offset) => ({ card, index: spreadCards.length + offset }))
            .filter((entry) => entry.card.clarifies === parent.positionLabel),
        }))
        .filter((group) => group.clarifiers.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drawn],
  );

  function deal() {
    const cards = dealSpread(spread.positions, {
      allowReversals: reversals,
      majorsOnly,
      deckId,
      clarifiers: useClarifiers ? clarifierCount : 0,
    });
    setDrawn(cards);
    setRevealed(0);
    setActiveIndex(null);
    setInterpretation("");
    stopVoice();
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
      const cards = drawn.map((d) => ({
        name: `${cardTitle(d.card, getDeck(d.deckId))} (${getDeck(d.deckId).name})`,
        reversed: d.reversed,
        positionLabel: d.positionLabel,
        positionMeaning: d.positionMeaning,
        keywords: cardKeywords(d),
        meaning: cardMeaning(d),
      }));

      let memory = "";
      let history = "";
      if (user) {
        try {
          const ctx = await getOracleContext();
          memory = ctx.notes;
          history = ctx.history;
        } catch {
          // memory is optional
        }
      }
      const querentName =
        (user?.user_metadata?.["display_name"] as string | undefined) ??
        user?.email?.split("@")[0] ??
        undefined;

      const result = await interpretReading({
        data: {
          intention,
          deckName: deck.name,
          deckTradition: deck.tradition,
          spreadName: spread.name,
          cards,
          ...(querentName ? { querentName } : {}),
          ...(memory ? { memory } : {}),
          ...(history ? { history } : {}),
        },
      });
      setInterpretation(result.interpretation);
      void speakAloud(result.interpretation);
      if (user) {
        rememberReading({
          data: {
            intention,
            cardNames: cards.map((c) => `${c.name}${c.reversed ? " (reversed)" : ""}`),
            interpretation: result.interpretation,
          },
        }).catch(() => undefined);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The oracle could not speak.");
    } finally {
      setInterpreting(false);
    }
  }

  function stopVoice() {
    voiceRunRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
    setLoadingVoice(false);
  }

  async function speakAloud(text?: string) {
    const spoken = text ?? interpretation;
    if (!text && speaking) {
      stopVoice();
      return;
    }
    if (!spoken) return;
    stopVoice();
    const run = voiceRunRef.current;
    const chunks = chunkNarration(spoken);
    if (!chunks.length) return;
    setLoadingVoice(true);
    try {
      // A single chunk failing must never end the reading — retry, then skip.
      const fetchChunk = async (index: number): Promise<string | null> => {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const { audio, mimeType } = await speakReading({ data: { text: chunks[index]! } });
            return `data:${mimeType};base64,${audio}`;
          } catch {
            await new Promise((resolve) => window.setTimeout(resolve, 700 * (attempt + 1)));
          }
        }
        return null;
      };

      // Keep two chunks in flight so playback never waits on the network.
      const queue: Array<Promise<string | null>> = [];
      const enqueue = (index: number) => {
        if (index < chunks.length) queue[index] = fetchChunk(index);
      };
      enqueue(0);
      enqueue(1);

      let spokeSomething = false;
      for (let index = 0; index < chunks.length; index++) {
        const src = await queue[index];
        if (voiceRunRef.current !== run) return;
        enqueue(index + 2);
        if (!src) continue;

        const element = new Audio(src);
        element.preload = "auto";
        audioRef.current = element;
        setLoadingVoice(false);
        setSpeaking(true);
        spokeSomething = true;
        await new Promise<void>((resolve) => {
          element.onended = () => resolve();
          element.onerror = () => resolve();
          element.play().catch(() => resolve());
        });
        if (voiceRunRef.current !== run) return;
      }
      setSpeaking(false);
      if (!spokeSomething) toast.error("The oracle could not find her voice.");
    } catch (error) {
      if (voiceRunRef.current !== run) return;
      setSpeaking(false);
      toast.error(error instanceof Error ? error.message : "The oracle could not find her voice.");
    } finally {
      if (voiceRunRef.current === run) setLoadingVoice(false);
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
            name: `${cardTitle(d.card, getDeck(d.deckId))} (${getDeck(d.deckId).name})`,
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
              {DECK_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDeckId(item.id)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    item.id === "blend" && "col-span-2",
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
              {customSpreads.length ? (
                <optgroup label="My spreads">
                  {customSpreads.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.positions.length} cards
                    </option>
                  ))}
                </optgroup>
              ) : null}
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

          <div className="rounded-md border border-gold/15 bg-background/30 p-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={useClarifiers}
                onChange={(event) => setUseClarifiers(event.target.checked)}
                className="accent-[oklch(0.78_0.12_85)]"
              />
              Deal a clarification card for each card
            </label>
            {useClarifiers ? (
              <>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                {spread.positions.length * clarifierCount} clarifier
                {spread.positions.length * clarifierCount === 1 ? "" : "s"} total
              </p>
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setClarifierCount(count)}
                    className={cn(
                      "flex-1 rounded-md border px-2 py-1.5 text-xs transition-colors",
                      clarifierCount === count
                        ? "border-gold/70 bg-secondary text-foreground"
                        : "border-border text-muted-foreground hover:border-gold/40",
                    )}
                  >
                    {count} per card
                  </button>
                ))}
              </div>
              </>
            ) : null}
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
          <Link to="/builder" className="block text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
            Build a custom spread
          </Link>
        </div>

        <div className="space-y-5">
          {phase === "intention" ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-gold/20 p-10 text-center">
              <OracleOrb glyph={deck.glyph} />
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                The {spread.name} spread lays {spread.positions.length}{" "}
                {spread.positions.length === 1 ? "card" : "cards"}. When you are ready, shuffle.
              </p>
            </div>
          ) : phase === "shuffling" ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-lg border border-gold/20 p-10 text-center">
              <OracleOrb state="thinking" glyph={deck.glyph} />
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Shuffling…</p>
            </div>
          ) : (
            <>
              <ReadingCloth
                positions={spread.positions}
                drawn={spreadCards}
                deck={deck}
                revealed={revealed}
                activeIndex={activeIndex}
                onSelect={(index) => setActiveIndex(index === activeIndex ? null : index)}
              />

              {clarifierGroups.length ? (
                <div className="space-y-4 rounded-lg border border-gold/15 bg-veil/30 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold-soft">Clarification</p>
                  {clarifierGroups.map((group) => (
                    <div
                      key={group.parentIndex}
                      className="rounded-md border border-gold/15 bg-background/30 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveIndex(group.parentIndex === activeIndex ? null : group.parentIndex)
                          }
                          className="w-14 shrink-0 sm:w-16"
                        >
                          <CardFace
                            card={group.parent.card}
                            deck={getDeck(group.parent.deckId)}
                            reversed={group.parent.reversed}
                            faceDown={group.parentIndex >= revealed}
                            selected={activeIndex === group.parentIndex}
                          />
                        </button>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-gold-soft">
                            {group.parent.positionLabel}
                          </p>
                          <p className="text-sm text-foreground">
                            {group.parentIndex < revealed
                              ? cardTitle(group.parent.card, getDeck(group.parent.deckId))
                              : "—"}
                            {group.parentIndex < revealed && group.parent.reversed ? (
                              <span className="text-xs text-ember"> · reversed</span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Clarified by {group.clarifiers.length} card
                            {group.clarifiers.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-3 border-l border-dashed border-gold/30 pl-4">
                        {group.clarifiers.map(({ card, index }) => (
                          <div key={index} className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveIndex(index === activeIndex ? null : index)}
                              className="w-12 shrink-0 sm:w-14"
                            >
                              <CardFace
                                card={card.card}
                                deck={getDeck(card.deckId)}
                                reversed={card.reversed}
                                faceDown={index >= revealed}
                                selected={activeIndex === index}
                              />
                            </button>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-[0.2em] text-gold-soft/80">
                                ↳ Clarifies {card.clarifies}
                              </p>
                              {index < revealed ? (
                                <>
                                  <p className="text-sm text-foreground">
                                    {cardTitle(card.card, getDeck(card.deckId))}
                                    {card.reversed ? (
                                      <span className="text-xs text-ember"> · reversed</span>
                                    ) : null}
                                  </p>
                                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                    {cardKeywords(card).join(" · ")}
                                  </p>
                                  <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                                    {cardMeaning(card)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs text-muted-foreground">Still face down…</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {active ? (
                <div className="rounded-lg border border-gold/25 bg-card/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
                    {active.positionLabel} — {active.positionMeaning}
                  </p>
                  <h2 className="mt-2 text-2xl text-foreground">
                    {cardTitle(active.card, getDeck(active.deckId))}
                    {active.reversed ? <span className="text-base text-ember"> · reversed</span> : null}
                  </h2>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold-soft/80">
                    {getDeck(active.deckId).name}
                  </p>
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
                <article className="animate-fade-in rounded-lg border border-gold/25 bg-veil/50 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <OracleOrb
                        state={speaking ? "speaking" : loadingVoice ? "thinking" : "idle"}
                        glyph={deck.glyph}
                        className="w-16"
                      />
                      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-soft">The reading</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void speakAloud()}
                      disabled={loadingVoice}
                      className="rounded-md border border-gold/50 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-secondary disabled:opacity-40"
                    >
                      {loadingVoice ? "Finding her voice…" : speaking ? "Silence her" : "Hear her speak"}
                    </button>
                  </div>
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
