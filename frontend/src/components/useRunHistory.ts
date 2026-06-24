"use client";

import { SavedRunRecord } from "@careersim/engine";

const KEY = "a-day-in-runs";
const MAX = 24;

export function loadRunHistory(): SavedRunRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedRunRecord[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveRunRecord(record: SavedRunRecord): void {
  const list = [record, ...loadRunHistory().filter((r) => r.id !== record.id)].slice(
    0,
    MAX,
  );
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteRunRecord(id: string): void {
  localStorage.setItem(
    KEY,
    JSON.stringify(loadRunHistory().filter((r) => r.id !== id)),
  );
}

export function clearRunHistory(): void {
  localStorage.removeItem(KEY);
}

export function downloadReport(run: SavedRunRecord): void {
  const blob = new Blob([run.report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `a-day-in-${run.careerId}-${run.completedAt.slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyReport(run: SavedRunRecord): Promise<void> {
  await navigator.clipboard.writeText(run.report);
}
