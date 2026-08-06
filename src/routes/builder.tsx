import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SpreadPosition } from "@/lib/tarot/spreads";
import {
  deleteCustomSpread,
  loadCustomSpreads,
  makeCustomSpreadId,
  newPosition,
  saveCustomSpread,
  type CustomSpread,
} from "@/lib/tarot/customSpreads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Custom Spread Builder — Design Your Own Tarot Layout" },
      {
        name: "description",
        content:
          "Drag and drop any number of cards onto the cloth, name each position and define what it asks, then deal your own tarot spread.",
      },
      { property: "og:title", content: "Custom Tarot Spread Builder" },
      {
        property: "og:description",
        content: "Place cards freely, define each position, and read your own spread with the Oracle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuilderPage,
});

const clamp = (value: number) => Math.min(96, Math.max(4, value));

function BuilderPage() {
  const navigate = useNavigate();
  const clothRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);

  const [spreadId, setSpreadId] = useState(() => makeCustomSpreadId());
  const [name, setName] = useState("My Spread");
  const [summary, setSummary] = useState("A layout of my own making.");
  const [positions, setPositions] = useState<SpreadPosition[]>([newPosition(0), newPosition(1), newPosition(2)]);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [saved, setSaved] = useState<CustomSpread[]>([]);

  useEffect(() => {
    setSaved(loadCustomSpreads());
  }, []);

  const active = activeIndex !== null ? positions[activeIndex] : undefined;

  function updatePosition(index: number, patch: Partial<SpreadPosition>) {
    setPositions((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function pointFromEvent(event: { clientX: number; clientY: number }) {
    const rect = clothRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100),
    };
  }

  function onPointerDown(index: number, event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragRef.current = index;
    setActiveIndex(index);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current === null) return;
    const point = pointFromEvent(event);
    if (point) updatePosition(dragRef.current, point);
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function addCard() {
    setPositions((current) => {
      const next = [...current, newPosition(current.length)];
      setActiveIndex(next.length - 1);
      return next;
    });
  }

  function removeCard(index: number) {
    setPositions((current) => current.filter((_, i) => i !== index));
    setActiveIndex(null);
  }

  function save() {
    if (!positions.length) {
      toast.error("Add at least one card position.");
      return;
    }
    const spread: CustomSpread = {
      id: spreadId,
      name: name.trim() || "My Spread",
      category: "custom",
      summary: summary.trim() || "A layout of my own making.",
      bestFor: summary.trim() || "A layout of my own making.",
      positions,
      custom: true,
      updatedAt: Date.now(),
    };
    setSaved(saveCustomSpread(spread));
    toast.success("Spread saved. It now appears in the reading page.");
  }

  function loadSpread(spread: CustomSpread) {
    setSpreadId(spread.id);
    setName(spread.name);
    setSummary(spread.summary);
    setPositions(spread.positions);
    setActiveIndex(null);
  }

  function startNew() {
    setSpreadId(makeCustomSpreadId());
    setName("My Spread");
    setSummary("A layout of my own making.");
    setPositions([newPosition(0)]);
    setActiveIndex(0);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl text-foreground">Spread builder</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Drag cards anywhere on the cloth, add as many as the reading needs, and give every position a
        name and a question. Saved spreads appear in the deal menu on the reading page.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="relative w-full overflow-hidden rounded-lg border border-gold/15 bg-veil/40 p-3">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_50%_35%,oklch(0.4_0.09_300/0.35),transparent_65%)]" />
            <div
              ref={clothRef}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="relative aspect-[4/3] w-full touch-none sm:aspect-[16/9]"
            >
              {positions.map((position, index) => (
                <div
                  key={index}
                  onPointerDown={(event) => onPointerDown(index, event)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className="absolute w-[15%] min-w-14 max-w-28 -translate-x-1/2 -translate-y-1/2 cursor-grab select-none active:cursor-grabbing"
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  <div
                    className={cn(
                      "card-back flex aspect-[2/3] w-full items-center justify-center rounded-md border transition-shadow",
                      position.rotated && "rotate-90",
                      activeIndex === index ? "border-gold glow" : "border-gold/30",
                    )}
                  >
                    <span className="text-gradient-gold font-display text-lg">{index + 1}</span>
                  </div>
                  <p className="mt-1 truncate text-center text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    {position.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addCard}
              className="rounded-md border border-gold/60 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-secondary"
            >
              Add card
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-[image:var(--gradient-gold)] px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save spread
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="rounded-md border border-border px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
            >
              Go deal it
            </button>
            <button
              type="button"
              onClick={startNew}
              className="rounded-md border border-border px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
            >
              New
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-3 rounded-lg border border-gold/15 bg-card/60 p-5">
            <div>
              <label htmlFor="spread-name" className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
                Spread name
              </label>
              <input
                id="spread-name"
                value={name}
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background/60 p-2.5 text-sm text-foreground outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label htmlFor="spread-summary" className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
                What it is for
              </label>
              <textarea
                id="spread-summary"
                value={summary}
                rows={2}
                maxLength={200}
                onChange={(event) => setSummary(event.target.value)}
                className="mt-2 w-full resize-none rounded-md border border-input bg-background/60 p-2.5 text-sm text-foreground outline-none focus:border-gold/60"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gold/25 bg-card/70 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">
              {active ? `Position ${(activeIndex ?? 0) + 1}` : "Position"}
            </p>
            {active && activeIndex !== null ? (
              <div className="mt-3 space-y-3">
                <input
                  value={active.label}
                  maxLength={40}
                  onChange={(event) => updatePosition(activeIndex, { label: event.target.value })}
                  placeholder="Label"
                  className="w-full rounded-md border border-input bg-background/60 p-2.5 text-sm text-foreground outline-none focus:border-gold/60"
                />
                <textarea
                  value={active.meaning}
                  rows={3}
                  maxLength={200}
                  onChange={(event) => updatePosition(activeIndex, { meaning: event.target.value })}
                  placeholder="What this position asks"
                  className="w-full resize-none rounded-md border border-input bg-background/60 p-2.5 text-sm text-foreground outline-none focus:border-gold/60"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!!active.rotated}
                    onChange={(event) => updatePosition(activeIndex, { rotated: event.target.checked })}
                    className="accent-[oklch(0.78_0.12_85)]"
                  />
                  Lay this card crossed (rotated)
                </label>
                <button
                  type="button"
                  onClick={() => removeCard(activeIndex)}
                  className="text-[11px] uppercase tracking-[0.2em] text-ember hover:opacity-80"
                >
                  Remove position
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Tap or drag a card on the cloth to name it and define what it asks.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gold/15 bg-card/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">Saved spreads</p>
            {saved.length ? (
              <ul className="mt-3 space-y-2">
                {saved.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => loadSpread(item)}
                      className="truncate text-left text-foreground hover:text-gold"
                    >
                      {item.name}{" "}
                      <span className="text-xs text-muted-foreground">· {item.positions.length} cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaved(deleteCustomSpread(item.id))}
                      className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ember"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Nothing saved yet.</p>
            )}
            <Link to="/spreads" className="mt-4 inline-block text-[11px] uppercase tracking-[0.2em] text-gold hover:opacity-80">
              Browse classic spreads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
