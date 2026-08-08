import { cn } from "@/lib/utils";

type OrbState = "idle" | "thinking" | "speaking";

interface Props {
  state?: OrbState;
  glyph?: string;
  className?: string;
}

const SPARKS = [
  { left: "12%", top: "22%", delay: "0s" },
  { left: "82%", top: "30%", delay: "0.7s" },
  { left: "30%", top: "78%", delay: "1.4s" },
  { left: "68%", top: "72%", delay: "2.1s" },
  { left: "50%", top: "8%", delay: "2.6s" },
];

/** A living sigil for the Oracle: breathes when idle, churns while she thinks, ripples while she speaks. */
export function OracleOrb({ state = "idle", glyph = "✶", className }: Props) {
  return (
    <div className={cn("relative aspect-square w-40 select-none", className)} aria-hidden="true">
      {state === "speaking" ? (
        <>
          <span className="animate-orb-ripple absolute inset-0 rounded-full border border-gold/40" />
          <span
            className="animate-orb-ripple absolute inset-0 rounded-full border border-gold/25"
            style={{ animationDelay: "1.2s" }}
          />
        </>
      ) : null}

      <div className="absolute inset-0 rounded-full opacity-70 blur-2xl [background:radial-gradient(circle,oklch(0.55_0.14_300/0.7),transparent_70%)]" />

      <div
        className={cn(
          "absolute inset-2 rounded-full border border-gold/25",
          state === "thinking" ? "animate-orb-spin" : "animate-orb-pulse",
        )}
        style={{
          background:
            "radial-gradient(circle at 34% 28%, oklch(0.42 0.11 300 / 0.95), oklch(0.16 0.05 290 / 0.95) 68%)",
          boxShadow: "var(--shadow-arcane)",
        }}
      />

      <div
        className={cn(
          "absolute inset-5 rounded-full border border-dashed border-gold/30",
          state === "thinking" ? "animate-orb-spin" : null,
        )}
        style={state === "thinking" ? { animationDirection: "reverse", animationDuration: "11s" } : undefined}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "text-gradient-gold text-4xl",
            state === "speaking" ? "animate-orb-pulse" : "animate-float",
          )}
        >
          {glyph}
        </span>
      </div>

      {SPARKS.map((spark) => (
        <span
          key={spark.delay}
          className="animate-sparkle absolute h-1 w-1 rounded-full bg-gold/80"
          style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }}
        />
      ))}
    </div>
  );
}
