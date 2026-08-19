export type OracleStatusKind = "unknown" | "ok" | "low" | "blocked" | "rate_limited" | "error";

export type OracleStatus = {
  kind: OracleStatusKind;
  message: string;
  checkedAt: number | null;
};

let current: OracleStatus = { kind: "unknown", message: "Not checked yet.", checkedAt: null };
const listeners = new Set<(status: OracleStatus) => void>();

export function getOracleStatus() {
  return current;
}

export function setOracleStatus(next: Omit<OracleStatus, "checkedAt">) {
  current = { ...next, checkedAt: Date.now() };
  listeners.forEach((listener) => listener(current));
}

export function subscribeOracleStatus(listener: (status: OracleStatus) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Classify a thrown gateway/server error so the status panel can explain it. */
export function reportOracleFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/402|credit/i.test(message)) {
    setOracleStatus({
      kind: "low",
      message: "AI credits are exhausted — readings and voice will fail until the workspace is topped up.",
    });
    return;
  }
  if (/429|overwhelmed|too many/i.test(message)) {
    setOracleStatus({ kind: "rate_limited", message: "Rate limited — wait a moment and try again." });
    return;
  }
  if (/403|disabled|blocked/i.test(message)) {
    setOracleStatus({ kind: "blocked", message: "AI access is blocked by workspace policy." });
    return;
  }
  if (message) setOracleStatus({ kind: "error", message: message.slice(0, 180) });
}

export function reportOracleSuccess() {
  setOracleStatus({ kind: "ok", message: "The oracle answered — readings and voice are working." });
}
