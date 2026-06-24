"use client";

import { MeterDef, StateDelta } from "@careersim/engine";

export function DeltaPreview({
  delta,
  meters,
  visible,
}: {
  delta: StateDelta;
  meters: MeterDef[];
  visible: boolean;
}) {
  if (!visible) return null;
  const parts: string[] = [];
  if (delta.energy) {
    parts.push(`${delta.energy > 0 ? "+" : ""}${delta.energy} energy`);
  }
  if (delta.meters) {
    for (const [id, v] of Object.entries(delta.meters)) {
      const def = meters.find((m) => m.id === id);
      if (def && v) parts.push(`${v > 0 ? "+" : ""}${v} ${def.label.toLowerCase()}`);
    }
  }
  if (delta.advanceMinutes) {
    parts.push(`+${delta.advanceMinutes} min`);
  }
  if (parts.length === 0) return null;
  return (
    <div className="eyebrow faint" style={{ fontSize: 10, marginTop: 4 }}>
      {parts.join(" · ")}
    </div>
  );
}
