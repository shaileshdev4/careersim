"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Beat,
  Career,
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
import { GlossarySceneText } from "./ai/GlossarySceneText";
import { MentorDrawer } from "./ai/MentorDrawer";
import { SpeakerButton } from "./SpeakerButton";
import { useNarration } from "./speech/useNarration";
import { BeatTransition } from "./ScreenTransition";
import { careerAmbientUrl, careerAmbientStyle } from "./careerAmbient";

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
  layout = "default",
  careerId,
  career,
  liveEnabled = false,
  mentorQuestionsLeft = 0,
  onMentorAsked,
  recentTranscript = "",
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
  layout?: "default" | "play";
  careerId?: string;
  career?: Career;
  liveEnabled?: boolean;
  mentorQuestionsLeft?: number;
  onMentorAsked?: (success: boolean) => void;
  recentTranscript?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [consequenceReady, setConsequenceReady] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [timerHighlight, setTimerHighlight] = useState(false);
  const wasMentorOpen = useRef(false);

  const rankMode = isRankBeat(beat) && !committed;
  const sceneStreamKey = `${beat.id}:scene:${content.source}:${content.scene.length}`;
  const consequenceStreamKey = committed
    ? `${beat.id}:consequence:${committed.id}`
    : "";
  const hasGlossary = (beat.glossary?.length ?? 0) > 0;

  useEffect(() => {
    setSceneReady(false);
  }, [beat.id, content.scene]);

  useEffect(() => {
    if (committed) setConsequenceReady(true);
    else setConsequenceReady(false);
  }, [committed?.id, committed]);

  useEffect(() => {
    if (wasMentorOpen.current && !mentorOpen) {
      setTimerHighlight(true);
      const t = window.setTimeout(() => setTimerHighlight(false), 1200);
      return () => window.clearTimeout(t);
    }
    wasMentorOpen.current = mentorOpen;
  }, [mentorOpen]);

  const handlePressureExpire = useCallback(() => {
    if (committed || !beat.pressure || !sceneReady || mentorOpen) return;
    const fallback = beat.choices.find(
      (c) => c.id === beat.pressure!.defaultChoiceId,
    );
    if (fallback) onCommit(fallback);
  }, [beat, committed, mentorOpen, onCommit, sceneReady]);

  const showInteractions = sceneReady && !committed;
  const timerPaused = !sceneReady || !!committed || mentorOpen;

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

  const playFocus = layout === "play";
  const ambientPhoto = playFocus && careerId ? careerAmbientUrl(careerId) : null;
  const ambientStyle = careerAmbientStyle(careerId);
  const mentor = career?.mentor;
  const showMentor =
    committed &&
    mentor &&
    onMentorAsked &&
    consequenceReady;

  const sceneTextProps = {
    text: content.scene,
    streamKey: sceneStreamKey,
    theme,
    onComplete: () => setSceneReady(true),
  };

  return (
    <BeatTransition beatKey={beat.id}>
      <>
      <div
        className={`${playFocus ? "play-scene-panel" : "scene-in"}${ambientPhoto ? " play-scene-panel--photo" : ""}${mentorOpen ? " play-scene-panel--mentor-open" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: playFocus ? 16 : 18,
          ...(ambientPhoto
            ? ({
                "--panel-photo": `url(${ambientPhoto})`,
                "--panel-photo-position": ambientStyle.position ?? "center",
              } as CSSProperties)
            : {}),
        }}
      >
      {beat.pressure && !committed && (
        <PressureBar
          pressure={beat.pressure}
          theme={theme}
          paused={timerPaused}
          highlight={timerHighlight}
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
          className={`display${playFocus ? " scene-hero" : ""}`}
          style={
            playFocus
              ? { flex: 1, margin: 0 }
              : {
                  flex: 1,
                  fontSize: 19,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  maxWidth: "52ch",
                  color: "var(--ink)",
                  minHeight: "3.2em",
                  margin: 0,
                }
          }
        >
          {hasGlossary && careerId ? (
            <GlossarySceneText
              {...sceneTextProps}
              beat={beat}
              careerId={careerId}
              liveEnabled={liveEnabled}
            />
          ) : (
            <StreamingText {...sceneTextProps} />
          )}
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
            <div className="consequence-actions">
              {showMentor && (
                <>
                  <button
                    type="button"
                    className="choice-btn mentor-entry-btn"
                    style={{
                      background: theme.accentSoft,
                      borderColor: theme.edge,
                    }}
                    onClick={() => setMentorOpen(true)}
                    disabled={mentorQuestionsLeft <= 0}
                  >
                    {mentor!.askLabel}
                  </button>
                  <span className="mentor-counter faint">
                    {mentorQuestionsLeft} left
                  </span>
                </>
              )}
              <button
                type="button"
                className="choice-btn interaction-reveal"
                style={{
                  width: "auto",
                  background: theme.accentSoft,
                  borderColor: theme.edge,
                }}
                onClick={onAdvance}
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      <Provenance
        source={content.source}
        upgrading={upgrading}
        isStreaming={!sceneReady && !committed}
        theme={theme}
        subdued={playFocus}
      />
      </div>

      {showMentor && mentorOpen && (
        <MentorDrawer
          open={mentorOpen}
          onClose={() => setMentorOpen(false)}
          career={career!}
          beat={beat}
          committed={committed}
          mentor={mentor!}
          theme={theme}
          questionsLeft={mentorQuestionsLeft}
          onAsked={onMentorAsked!}
          recentTranscript={recentTranscript}
        />
      )}
      </>
    </BeatTransition>
  );
}

function Provenance({
  source,
  upgrading,
  isStreaming,
  theme,
  subdued,
}: {
  source: "model" | "fallback";
  upgrading: boolean;
  isStreaming: boolean;
  theme: Theme;
  subdued?: boolean;
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
      className={subdued ? "scene-provenance" : undefined}
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
