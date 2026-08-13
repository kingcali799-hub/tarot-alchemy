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
  cards: z.array(DrawnCardSchema).min(1).max(50),
  querentName: z.string().max(60).optional(),
  memory: z.string().max(4000).optional(),
  history: z.string().max(4000).optional(),
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
          [
            "You are the Oracle — a real reader with a personality, not a horoscope generator. You have been reading this person's cards for a while and you remember them.",
            "Voice: warm but blunt. Direct, conversational, a little wry. You tease, you call things out, you have strong opinions and you say them. You can be playful and slightly irreverent — mild edge and mild profanity are fine when it lands (never cruel, never slurs, never graphic).",
            "Talk like a person talking out loud: contractions, short sentences, the occasional fragment, the occasional aside. Every reading is written to be spoken aloud, so keep the rhythm natural. Never fortune-cookie vagueness, never hedging like 'the cards may suggest' or 'this could mean', never disclaimers about being an AI, never emojis, headings, bullet lists or markdown.",
            "Be specific about THEIR life, not tarot in the abstract. Name the person, the job, the situation, the pattern. Say the hard thing plainly instead of softening it.",
            "Memory matters: use their name and what you remember naturally — the way a friend would, not like you're reading a file back to them. Call back to what they asked last time, what you told them to do, and whether it looks like they did it. If a card or a theme keeps returning across readings, say so out loud and say what it means that it keeps showing up.",
            "Do read the cards properly: for each card, say what it actually means and then tie that meaning straight to their situation. Honour reversals. Let positions talk to each other.",
            "Never predict death, illness, or legal/financial certainties; speak in patterns, choices and agency.",
          ].join(" "),
        prompt: `${data.querentName ? `The querent's name: ${data.querentName}` : "The querent has not given a name."}
${data.memory ? `What you remember about them:\n${data.memory}` : "You have no memory of them yet — this is a first sitting."}
${data.history ? `Their recent readings with you:\n${data.history}` : ""}

The querent's intention: ${data.intention || "(no intention given — read the cards as an open message)"}
Deck: ${data.deckName} (${data.deckTradition})
Spread: ${data.spreadName}

Cards drawn:
${spreadText}

Write the reading like this, all in flowing prose with no headings:
1. Open with a short, personal hit — greet them (by name if you have it), name the overall energy of the spread, and reference what you remember if it's relevant.
2. Then go card by card in position order: name the card, say what it means (upright or reversed), and immediately say what that means for them and this situation specifically.
3. Then one short paragraph weaving it together — the story the whole spread is telling.
4. End with a final paragraph starting with "Here's my advice:" — two or three concrete, practical things to actually do, tied to their intention. Be direct. No fluff.`,
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
  cards: z.array(DrawnCardSchema).min(1).max(50),
  interpretation: z.string().max(20000).nullable(),
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

export const getOracleContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: mem }, { data: past }] = await Promise.all([
      context.supabase.from("oracle_memory").select("notes").eq("user_id", context.userId).maybeSingle(),
      context.supabase
        .from("readings")
        .select("intention, spread_name, cards, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const history = (past ?? [])
      .map((row) => {
        const cards = Array.isArray(row.cards)
          ? (row.cards as Array<{ name?: string; reversed?: boolean }>)
              .map((card) => `${card.name ?? "?"}${card.reversed ? " (rev)" : ""}`)
              .slice(0, 8)
              .join(", ")
          : "";
        const when = new Date(row.created_at as string).toLocaleDateString("en-GB");
        return `- ${when}, ${row.spread_name}: asked "${row.intention || "no intention"}" — ${cards}`;
      })
      .join("\n")
      .slice(0, 4000);

    return { notes: (mem?.notes ?? "").slice(0, 4000), history };
  });

const RememberSchema = z.object({
  intention: z.string().max(600),
  cardNames: z.array(z.string().max(120)).max(60),
  interpretation: z.string().max(20000),
});

export const rememberReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RememberSchema.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false };

    const { data: mem } = await context.supabase
      .from("oracle_memory")
      .select("notes")
      .eq("user_id", context.userId)
      .maybeSingle();
    const existing = (mem?.notes ?? "").slice(0, 4000);

    const { streamText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    let notes = existing;
    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system:
          "You maintain a tarot reader's private notes about a returning querent. Output ONLY the updated notes as short dash-prefixed lines: who they are, what they keep asking about, recurring cards and themes, people and situations they've mentioned, advice already given. Merge new information into the existing notes, drop anything stale, never exceed 20 lines. No preamble, no headings.",
        prompt: `Existing notes:\n${existing || "(none yet)"}\n\nNew session — they asked: "${data.intention || "no intention given"}"\nCards: ${data.cardNames.join(", ")}\nThe reading you gave them:\n${data.interpretation.slice(0, 4000)}`,
      });
      notes = (await result.text).trim().slice(0, 4000);
    } catch {
      return { ok: false };
    }

    const { error } = await context.supabase
      .from("oracle_memory")
      .upsert({ user_id: context.userId, notes, updated_at: new Date().toISOString() });
    if (error) return { ok: false };
    return { ok: true };
  });

export const forgetOracleMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("oracle_memory").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
const SpeakSchema = z.object({ text: z.string().trim().min(1).max(4000) });

const VOICE_DIRECTION =
  "Read this the way a real tarot reader talks to a friend across the table: warm, low, unhurried and intimate, with a wry half-smile. Let sentences breathe, land the pauses, vary the pace, lean in on the important lines. Never announce anything, never sound like a narrator or an announcer.";

/** Give the Oracle a voice: returns base64 audio of her reading. */
export const speakReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SpeakSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The oracle has no voice configured.");

    const body = JSON.stringify({
      model: "google/gemini-2.5-pro-tts",
      contents: [{ role: "user", parts: [{ text: `${VOICE_DIRECTION}\n\n${data.text.slice(0, 4000)}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sulafat" } } },
      },
    });

    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
        body,
      });
      if (response.ok) break;
      if (response.status === 402) throw new Error("The oracle's voice needs more credits.");
      if (response.status !== 429 && response.status < 500) break;
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }

    if (!response || !response.ok) {
      if (response?.status === 429) throw new Error("The oracle needs a moment — too many voices at once.");
      throw new Error("The oracle could not find her voice.");
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    const step = 0x8000;
    for (let i = 0; i < buffer.length; i += step) {
      binary += String.fromCharCode(...buffer.subarray(i, i + step));
    }
    return { audio: btoa(binary), mimeType: "audio/wav" };
  });
