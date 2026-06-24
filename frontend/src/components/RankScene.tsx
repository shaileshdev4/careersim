"use client";

import { useState } from "react";
import { Beat, MeterDef, resolveRankChoice } from "@careersim/engine";
import { Theme } from "./theme";
import { DeltaPreview } from "./DeltaPreview";

export function RankScene({
  beat,
  meters,
  theme,
  onCommit,
}: {
  beat: Beat;
  meters: MeterDef[];
  theme: Theme;
  onCommit: (order: string[]) => void;
}) {
  const items = beat.rank!.items;
  const [order, setOrder] = useState(() => items.map((i) => i.id));

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= order.length) return;
    const copy = [...order];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setOrder(copy);
  };

  const previewChoice = resolveRankChoice(beat, order);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p className="eyebrow faint" style={{ fontSize: 10, margin: 0 }}>
        Rank who you see first - top priority sets your approach
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {order.map((id, index) => {
          const item = items.find((i) => i.id === id)!;
          return (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${index === 0 ? theme.accent : theme.edge}`,
                background: index === 0 ? theme.accentSoft : "rgba(0,0,0,0.25)",
              }}
            >
              <span
                className="mono faint"
                style={{ fontSize: 11, minWidth: 18 }}
              >
                {index + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                  {item.label}
                </div>
                {item.detail && (
                  <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>
                    {item.detail}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  type="button"
                  className="choice-btn"
                  style={{ width: 32, padding: "4px 0", textAlign: "center" }}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="choice-btn"
                  style={{ width: 32, padding: "4px 0", textAlign: "center" }}
                  disabled={index === order.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {previewChoice && (
        <DeltaPreview
          delta={previewChoice.delta}
          meters={meters}
          visible={true}
        />
      )}
      <button
        type="button"
        className="choice-btn"
        style={{ background: theme.accentSoft, borderColor: theme.edge }}
        onClick={() => onCommit(order)}
      >
        Commit this order →
      </button>
    </div>
  );
}
