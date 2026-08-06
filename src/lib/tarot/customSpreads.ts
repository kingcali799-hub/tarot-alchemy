import type { Spread, SpreadPosition } from "./spreads";

const STORAGE_KEY = "oracle.customSpreads.v1";

export interface CustomSpread extends Spread {
  category: "custom" | Spread["category"];
  custom: true;
  updatedAt: number;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCustomSpreads(): CustomSpread[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomSpread =>
        !!item && typeof item.id === "string" && Array.isArray(item.positions),
    );
  } catch {
    return [];
  }
}

export function saveCustomSpread(spread: CustomSpread): CustomSpread[] {
  const all = loadCustomSpreads().filter((item) => item.id !== spread.id);
  const next = [...all, spread].sort((a, b) => b.updatedAt - a.updatedAt);
  if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("oracle:custom-spreads"));
  return next;
}

export function deleteCustomSpread(id: string): CustomSpread[] {
  const next = loadCustomSpreads().filter((item) => item.id !== id);
  if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("oracle:custom-spreads"));
  return next;
}

export function makeCustomSpreadId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newPosition(index: number): SpreadPosition {
  const column = index % 5;
  const row = Math.floor(index / 5);
  return {
    label: `Position ${index + 1}`,
    meaning: "What this place in the spread asks.",
    x: 20 + column * 15,
    y: 30 + row * 25,
  };
}
