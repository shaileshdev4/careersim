"use client";

import { ArcProgress } from "@careersim/engine";

const KEY = "a-day-in-arcs";

export function loadArcs(): Record<string, ArcProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, ArcProgress>) : {};
  } catch {
    return {};
  }
}

export function saveArc(arc: ArcProgress): void {
  const all = loadArcs();
  all[arc.careerId] = arc;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearArc(careerId: string): void {
  const all = loadArcs();
  delete all[careerId];
  localStorage.setItem(KEY, JSON.stringify(all));
}
