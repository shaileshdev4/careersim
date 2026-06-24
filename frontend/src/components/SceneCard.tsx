"use client";

import { useCallback, useState } from "react";
import {
  Beat,
  Choice,
  DramatizedBeat,
  isRankBeat,
  MeterDef,
  resolveRankChoice,
} from "@careersim/engine";
import { Theme } from "./theme";
import { ArtifactPanel } from "./ArtifactPanel";
import { DeltaPreview } from "./DeltaPreview";
import { PressureBar } from "./PressureBar";
import { RankScene } from "./RankScene";

export function SceneCard({
  beat,
  content,
  committed,
  upgrading,
  theme,
  meters,
  onCommit,
  onCommitRank,
  onAdvance,
}: {
  beat: Beat;
  content: DramatizedBeat;
  committed: Choice | null;
  upgrading: boolean;
  theme: Theme;
  meters: MeterDef[];
  onCommit: (choice: Choice) => void;
  onCommitRank: (order: string[]) => void;
  onAdvance: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const rankMode = isRankBeat(beat) && !committed;

  const handlePressureExpire = useCallback(() => {
    if (committed || !beat.pressure) return;
    const fallback = beat.choices.find(
      (c) => c.id === beat.pressure!.defaultChoiceId,
    );
    if (fallback) onCommit(fallback);
  }, [beat, committed, onCommit]);

  return (
    <div
      className="scene-in"
      key={beat.id}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      {beat.pressure && !committed && (
        <PressureBar
          pressure={beat.pressure}
          theme={theme}
          paused={!!committed}
          onExpire={handlePressureExpire}
        />
      )}

      <p
        className="display"
        style={{
          fontSize: 19,
          lineHeight: 1.5,
          fontWeight: 500,
          maxWidth: "52ch",
          color: "var(--ink)",
        }}
      >
        {content.scene}
      </p>

      {beat.artifacts && beat.artifacts.length > 0 && !committed && (
        <ArtifactPanel artifacts={beat.artifacts} theme={theme} />
      )}

      {!committed ? (
        rankMode ? (
          <RankScene
            beat={beat}
            meters={meters}
            theme={theme}
            onCommit={onCommitRank}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {beat.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="choice-btn"
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(c.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => onCommit(c)}
              >
                {content.choiceLabels[c.id] ?? c.label}
                <DeltaPreview
                  delta={c.delta}
                  meters={meters}
                  visible={hoveredId === c.id}
                />
              </button>
            ))}
          </div>
        )
      ) : (
        <div
          className="scene-in"
          style={{
            borderLeft: `2px solid ${theme.accent}`,
            paddingLeft: 14,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)" }}>
            {committed.consequence}
          </p>
          <button
            type="button"
            className="choice-btn"
            style={{
              alignSelf: "flex-start",
              width: "auto",
              background: theme.accentSoft,
              borderColor: theme.edge,
            }}
            onClick={onAdvance}
          >
            Continue â†’
          </button>
        </div>
      )}

      <Provenance source={content.source} upgrading={upgrading} theme={theme} />
    </div>
  );
}

function Provenance({
  source,
  upgrading,
  theme,
}: {
  source: "model" | "fallback";
  upgrading: boolean;
  theme: Theme;
}) {
  const label = upgrading
    ? "dramatizingâ€¦"
    : source === "model"
      ? "live-dramatized"
      : "authored scene";
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}
    >
      <span
        className={upgrading ? "pulse-dot" : ""}
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          background: source === "model" ? theme.accent : "var(--ink-faint)",
        }}
      />
      <span className="eyebrow faint" style={{ fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
}
