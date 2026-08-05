import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { deleteReading, listReadings } from "@/lib/reading.functions";
import { getDeck } from "@/lib/tarot/decks";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({
    meta: [
      { title: "Your Reading Journal | Oracle" },
      { name: "description", content: "Every reading you have kept: intention, deck, spread, cards and interpretation." },
      { property: "og:title", content: "Your Reading Journal" },
      { property: "og:description", content: "Every tarot reading you have kept, in one place." },
    ],
  }),
  component: JournalPage,
});

interface StoredCard {
  name: string;
  reversed: boolean;
  positionLabel: string;
  meaning: string;
}

function JournalPage() {
  const fetchReadings = useServerFn(listReadings);
  const removeReading = useServerFn(deleteReading);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["readings"],
    queryFn: () => fetchReadings(),
  });

  async function remove(id: string) {
    try {
      await removeReading({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["readings"] });
    } catch {
      toast.error("Could not remove that reading.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl text-foreground">Your journal</h1>
      <p className="mt-2 text-sm text-muted-foreground">Readings you have kept, newest first.</p>

      {isLoading ? (
        <p className="mt-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">Opening the journal…</p>
      ) : !data?.length ? (
        <p className="mt-10 rounded-lg border border-dashed border-gold/20 p-10 text-center text-sm text-muted-foreground">
          Nothing kept yet. Draw a spread and choose “Keep in journal”.
        </p>
      ) : (
        <div className="mt-8 space-y-5">
          {data.map((reading) => {
            const cards = (reading.cards as unknown as StoredCard[]) ?? [];
            return (
              <article key={reading.id} className="rounded-lg border border-gold/15 bg-card/60 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-xl text-foreground">
                    {reading.intention || "An open question"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => remove(reading.id)}
                    className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gold-soft">
                  {reading.spread_name} · {getDeck(reading.deck_id).name} ·{" "}
                  {new Date(reading.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cards.map((card, index) => (
                    <li
                      key={`${card.name}-${index}`}
                      className="rounded-full border border-border px-3 py-1 text-[11px] text-foreground/85"
                    >
                      <span className="text-muted-foreground">{card.positionLabel}:</span> {card.name}
                      {card.reversed ? " ⤾" : ""}
                    </li>
                  ))}
                </ul>
                {reading.interpretation ? (
                  <div className="mt-4 space-y-3 font-display text-[16px] leading-relaxed text-foreground/90">
                    {reading.interpretation.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}