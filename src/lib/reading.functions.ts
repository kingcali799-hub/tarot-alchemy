import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const DrawnCardSchema = z.object({
  name: z.string().max(80),
  reversed: z.boolean(),
  positionLabel: z.string().max(80),
  positionMeaning: z.string().max(300),
  keywords: z.array(z.string().max(60)).max(6),
  meaning: z.string().max(1200),
});

const InterpretSchema = z.object({
  intention: z.string().trim().max(600),
  deckName: z.string().max(80),
  deckTradition: z.string().max(120),
  spreadName: z.string().max(80),
  cards: z.array(DrawnCardSchema).min(1).max(12),
});

export const interpretReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InterpretSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The oracle is not configured yet.");

    const { streamText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const spreadText = data.cards
      .map(
        (card, index) =>
          `${index + 1}. Position "${card.positionLabel}" (${card.positionMeaning}) — ${card.name}${
            card.reversed ? " (reversed)" : ""
          }. Keywords: ${card.keywords.join(", ")}. Traditional meaning: ${card.meaning}`,
      )
      .join("\n");

    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system:
          "You are the Oracle: an experienced, grounded tarot reader. You speak warmly and directly, in second person, never in fortune-cookie vagueness and never with disclaimers about being an AI. You read the cards as a whole story, letting positions interact rather than describing them one at a time. You honour reversals. You never predict death, illness, legal or financial certainties; you speak in terms of patterns, choices and agency. Use plain, vivid language. No emojis, no headings, no bullet lists.",
        prompt: `The querent's intention: ${data.intention || "(no intention given — read the cards as an open message)"}
Deck: ${data.deckName} (${data.deckTradition})
Spread: ${data.spreadName}

Cards drawn:
${spreadText}

Write the reading in 3 to 5 short paragraphs. Open by naming the overall energy of the spread. Weave the cards together in the order of their positions, referring to them by name. Close with one clear, practical piece of guidance tied to their intention.`,
      });
      const text = await result.text;
      return { interpretation: text.trim() };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("429")) throw new Error("The oracle is overwhelmed right now. Try again in a moment.");
      if (message.includes("402")) throw new Error("AI credits are exhausted. Add credits to continue readings.");
      throw new Error("The oracle could not speak. Please try again.");
    }
  });

const SaveSchema = z.object({
  intention: z.string().max(600),
  deckId: z.string().max(40),
  spreadId: z.string().max(60),
  spreadName: z.string().max(80),
  cards: z.array(DrawnCardSchema).min(1).max(12),
  interpretation: z.string().max(8000).nullable(),
});

export const saveReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("readings")
      .insert({
        user_id: context.userId,
        intention: data.intention,
        deck_id: data.deckId,
        spread_id: data.spreadId,
        spread_name: data.spreadName,
        cards: data.cards,
        interpretation: data.interpretation,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listReadings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("readings")
      .select("id, intention, deck_id, spread_id, spread_name, cards, interpretation, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("readings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });