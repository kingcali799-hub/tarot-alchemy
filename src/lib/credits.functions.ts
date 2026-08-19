import { createServerFn } from "@tanstack/react-start";

type ProbeResult = {
  kind: "ok" | "low" | "blocked" | "rate_limited" | "error";
  message: string;
};

/** Probe the AI gateway with a minimal request to see whether readings/voice can run. */
export const checkOracleCredits = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProbeResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { kind: "error", message: "The oracle is not configured yet." };

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          max_tokens: 1,
          messages: [{ role: "user", content: "ok" }],
        }),
      });
    } catch {
      return { kind: "error", message: "Could not reach the oracle's gateway." };
    }

    if (response.ok) {
      return { kind: "ok", message: "Credits available — readings and voice are working." };
    }

    const body = (await response.text()).slice(0, 300);
    if (response.status === 402) {
      return {
        kind: "low",
        message:
          "AI credits are exhausted. Readings and voice will fail until credits are added to the workspace.",
      };
    }
    if (response.status === 429) {
      return { kind: "rate_limited", message: "Rate limited right now — try again in a moment." };
    }
    if (response.status === 403) {
      return { kind: "blocked", message: "AI access is blocked by workspace policy or a credit limit." };
    }
    if (response.status === 401) {
      return { kind: "error", message: "The oracle's API key is missing or invalid." };
    }
    return { kind: "error", message: body || `Gateway error ${response.status}.` };
  },
);
