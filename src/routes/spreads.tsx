import { createFileRoute, Link } from "@tanstack/react-router";
import { SPREADS, SPREAD_CATEGORIES } from "@/lib/tarot/spreads";

export const Route = createFileRoute("/spreads")({
  head: () => ({
    meta: [
      { title: "Tarot Spreads — Celtic Cross, Horseshoe, Tree of Life | Oracle" },
      {
        name: "description",
        content:
          "Every classic tarot spread with position-by-position meanings: Celtic Cross, Horseshoe, Relationship Cross, Shadow Work, Tree of Life, Chakra Line and more.",
      },
      { property: "og:title", content: "Tarot Spreads and Their Positions" },
      { property: "og:description", content: "Position-by-position guides to every classic tarot spread." },
    ],
  }),
  component: SpreadsPage,
});

function SpreadsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl text-foreground">Spreads</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Each spread lays the cards in positions that ask a different question. Choose one on the
        reading page and the Oracle reads every card in its place.
      </p>

      {SPREAD_CATEGORIES.map((category) => (
        <section key={category.id} className="mt-10">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold-soft">{category.label}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {SPREADS.filter((spread) => spread.category === category.id).map((spread) => (
              <article key={spread.id} className="rounded-lg border border-gold/15 bg-card/60 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl text-foreground">{spread.name}</h3>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {spread.positions.length} cards
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{spread.summary}</p>
                <ol className="mt-3 space-y-1 text-xs text-foreground/80">
                  {spread.positions.slice(0, 6).map((position, index) => (
                    <li key={position.label}>
                      <span className="text-gold-soft">{index + 1}.</span> {position.label} —{" "}
                      <span className="text-muted-foreground">{position.meaning}</span>
                    </li>
                  ))}
                  {spread.positions.length > 6 ? (
                    <li className="text-muted-foreground">+ {spread.positions.length - 6} more positions</li>
                  ) : null}
                </ol>
                <Link
                  to="/"
                  className="mt-4 inline-block text-[11px] uppercase tracking-[0.2em] text-gold hover:opacity-80"
                >
                  Draw this spread
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}