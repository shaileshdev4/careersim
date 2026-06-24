"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Beat,
  Choice,
  DramatizedBeat,
  isRankBeat,
  MeterDef,
} from "@careersim/engine";
import { Theme } from "./theme";
import { ArtifactPanel } from "./ArtifactPanel";
import { DeltaPreview } from "./DeltaPreview";
import { PressureBar } from "./PressureBar";
import { RankScene } from "./RankScene";
import { StreamingText } from "./StreamingText";
import { SpeakerButton } from "./SpeakerButton";
import { useNarration } from "./speech/useNarration";

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
  const [sceneReady, setSceneReady] = useState(false);
  const [consequenceReady, setConsequenceReady] = useState(false);

  const rankMode = isRankBeat(beat) && !committed;
  const sceneStreamKey = `${beat.id}:scene:${content.source}:${content.scene.length}`;
  const consequenceStreamKey = committed
    ? `${beat.id}:consequence:${committed.id}`
    : "";

  useEffect(() => {
    setSceneReady(false);
  }, [beat.id, content.scene]);

  useEffect(() => {
    if (committed) setConsequenceReady(true);
    else setConsequenceReady(false);
  }, [committed?.id, committed]);

  const handlePressureExpire = useCallback(() => {
    if (committed || !beat.pressure || !sceneReady) return;
    const fallback = beat.choices.find(
      (c) => c.id === beat.pressure!.defaultChoiceId,
    );
    if (fallback) onCommit(fallback);
  }, [beat, committed, onCommit, sceneReady]);

  const showInteractions = sceneReady && !committed;
  const timerPaused = !sceneReady || !!committed;

  const sceneSpeechId = `scene:${sceneStreamKey}`;
  const sceneNarration = useNarration(
    content.scene,
    sceneSpeechId,
    theme.tempo,
    !committed,
  );

  const consequenceSpeechId = consequenceStreamKey
    ? `consequence:${consequenceStreamKey}`
    : "";
  const consequenceNarration = useNarration(
    committed?.consequence ?? "",
    consequenceSpeechId,
    theme.tempo,
    !!committed,
  );

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
          paused={timerPaused}
          onExpire={handlePressureExpire}
        />
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <p
          className="display"
          style={{
            flex: 1,
            fontSize: 19,
            lineHeight: 1.5,
            fontWeight: 500,
            maxWidth: "52ch",
            color: "var(--ink)",
            minHeight: "3.2em",
            margin: 0,
          }}
        >
          <StreamingText
            text={content.scene}
            streamKey={sceneStreamKey}
            theme={theme}
            onComplete={() => setSceneReady(true)}
          />
        </p>
        {sceneNarration.supported && !committed && (
          <SpeakerButton
            active={sceneNarration.isSpeaking}
            onClick={sceneNarration.toggle}
            theme={theme}
            label="Listen to scene"
          />
        )}
      </div>

      {showInteractions && beat.artifacts && beat.artifacts.length > 0 && (
        <div className="interaction-reveal">
          <ArtifactPanel artifacts={beat.artifacts} theme={theme} />
        </div>
      )}

      {showInteractions && (
        <div className="interaction-reveal">
          {rankMode ? (
            <RankScene
              beat={beat}
              meters={meters}
              theme={theme}
              onCommit={onCommitRank}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {beat.choices.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className="choice-btn choice-stagger"
                  style={{ animationDelay: `${i * 0.07}s` }}
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
          )}
        </div>
      )}

      {committed && (
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
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <p
              style={{
                flex: 1,
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              {committed.consequence}
            </p>
            {consequenceNarration.supported && (
              <SpeakerButton
                active={consequenceNarration.isSpeaking}
                onClick={consequenceNarration.toggle}
                theme={theme}
                label="Listen to consequence"
              />
            )}
          </div>
          {consequenceReady && (
            <button
              type="button"
              className="choice-btn interaction-reveal"
              style={{
                alignSelf: "flex-start",
                width: "auto",
                background: theme.accentSoft,
                borderColor: theme.edge,
              }}
              onClick={onAdvance}
            >
              Continue →
            </button>
          )}
        </div>
      )}

      <Provenance
        source={content.source}
        upgrading={upgrading}
        isStreaming={!sceneReady && !committed}
        theme={theme}
      />
    </div>
  );
}

function Provenance({
  source,
  upgrading,
  isStreaming,
  theme,
}: {
  source: "model" | "fallback";
  upgrading: boolean;
  isStreaming: boolean;
  theme: Theme;
}) {
  const label = upgrading
    ? "dramatizing…"
    : isStreaming
      ? "live"
      : source === "model"
        ? "live-dramatized"
        : "authored scene";
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}
    >
      <span
        className={upgrading || isStreaming ? "pulse-dot" : ""}
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          background:
            upgrading || isStreaming || source === "model"
              ? theme.accent
              : "var(--ink-faint)",
        }}
      />
      <span className="eyebrow faint" style={{ fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
}
