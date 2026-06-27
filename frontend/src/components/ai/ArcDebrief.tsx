"use client";

import { useState } from "react";
import { Career, RunResult, reflectArc, CAREERS } from "@careersim/engine";
import { Theme } from "../theme";
import { StreamingText } from "../StreamingText";
import { LiveDot } from "./LiveDot";
import { EnergyArcChart } from "./EnergyArcChart";
import { useArcNarrative } from "./useArcNarrative";

const NEUTRAL_TEMPO = 0.42;

export function ArcDebrief({
  career,
  days,
  theme,
  liveEnabled,
  onRestartArc,
  onTryAdjacent,
  onCompare,
}: {
  career: Career;
  days: RunResult[];
  theme: Theme;
  liveEnabled: boolean;
  onRestartArc: () => void;
  onTryAdjacent: (careerId: string) => void;
  onCompare: () => void;
}) {
  const { narrative, loading, payload } = useArcNarrative({
    career,
    days,
    liveEnabled,
  });
  const analysis = reflectArc(career, days);
  const [dataOpen, setDataOpen] = useState(false);
  const [p1Done, setP1Done] = useState(false);
  const [p2Done, setP2Done] = useState(false);

  const headline = narrative?.headline ?? analysis.pattern;
  const paragraphs = narrative?.paragraphs ?? [
    analysis.pattern,
    analysis.energyArc,
    "Notice what pulled at you when the week got hard - that's the signal, not a verdict.",
  ];
  const isLive = narrative?.source === "model";
  const energyStat = `${Math.round(payload.startEnergy)} → ${Math.round(payload.finalEnergy)} energy`;

  const streamTheme = { ...theme, tempo: NEUTRAL_TEMPO };

  return (
    <div className="arc-debrief scene-in">
      <section
        className="arc-debrief__hero"
        style={{
          background: `linear-gradient(180deg, ${career.mood.bgFrom} 0%, #000 100%)`,
          borderColor: theme.edge,
        }}
      >
        <div className="eyebrow" style={{ color: theme.accent }}>
          end of week · {career.title.toLowerCase()}
        </div>
        <h1 className="display arc-debrief__headline">{headline}</h1>
        <div className="mono arc-debrief__stat" style={{ color: theme.accent }}>
          {energyStat}
        </div>
        {loading && (
          <div className="arc-debrief__loading">
            <span
              className="arc-debrief__ring"
              style={{ borderColor: theme.accent }}
            />
            <span className="eyebrow faint">reading your week…</span>
          </div>
        )}
      </section>

      <div className="arc-debrief__paragraphs">
        <ArcParagraph
          eyebrow="the pattern"
          text={paragraphs[0]}
          streamKey="arc:p1"
          theme={streamTheme}
          active
          onComplete={() => setP1Done(true)}
        />
        {p1Done && (
          <ArcParagraph
            eyebrow="what it cost"
            text={paragraphs[1]}
            streamKey="arc:p2"
            theme={streamTheme}
            active
            onComplete={() => setP2Done(true)}
          />
        )}
        {p2Done && (
          <ArcParagraph
            eyebrow="what to notice"
            text={paragraphs[2]}
            streamKey="arc:p3"
            theme={streamTheme}
            active
            live={isLive && !loading}
            accent={theme.accent}
          />
        )}
      </div>

      <EnergyArcChart career={career} days={days} theme={theme} />

      <div className="arc-debrief__data">
        <button
          type="button"
          className="arc-debrief__data-toggle eyebrow faint"
          onClick={() => setDataOpen((o) => !o)}
        >
          the data → {dataOpen ? "▾" : "▸"}
        </button>
        {dataOpen && (
          <div className="arc-debrief__data-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {analysis.leans
                .filter((l) => l.count > 0)
                .map((l) => (
                  <p
                    key={l.tension.id}
                    className="dim"
                    style={{ fontSize: 13, margin: 0 }}
                  >
                    <span style={{ color: theme.accent }}>
                      {l.tension.label}
                    </span>
                    {" - "}
                    {l.score >= 0 ? l.tension.poleA : l.tension.poleB}
                  </p>
                ))}
            </div>
            {analysis.whatBroke.length > 0 && (
              <ul className="arc-debrief__broke">
                {analysis.whatBroke.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              {analysis.adjacent.map((a) => {
                const c = CAREERS[a.careerId];
                if (!c) return null;
                return (
                  <button
                    key={a.careerId}
                    type="button"
                    className="choice-btn"
                    style={{ width: "auto", fontSize: 12 }}
                    onClick={() => onTryAdjacent(a.careerId)}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
            <p className="dim" style={{ fontSize: 12, marginTop: 12 }}>
              {analysis.caveat}
            </p>
          </div>
        )}
      </div>

      <div className="arc-debrief__actions">
        <button
          type="button"
          className="choice-btn"
          style={{
            width: "auto",
            background: theme.accentSoft,
            borderColor: theme.edge,
          }}
          onClick={onRestartArc}
        >
          Try another week →
        </button>
        <button
          type="button"
          className="choice-btn"
          style={{ width: "auto" }}
          onClick={onCompare}
        >
          Compare two careers →
        </button>
      </div>
    </div>
  );
}

function ArcParagraph({
  eyebrow,
  text,
  streamKey,
  theme,
  active,
  onComplete,
  live,
  accent,
}: {
  eyebrow: string;
  text: string;
  streamKey: string;
  theme: Theme;
  active?: boolean;
  onComplete?: () => void;
  live?: boolean;
  accent?: string;
}) {
  if (!active) return null;
  return (
    <section
      className="arc-debrief__section"
      style={{ borderColor: "var(--accent-soft)" }}
    >
      <div className="eyebrow faint arc-debrief__section-label">{eyebrow}</div>
      <p className="arc-debrief__body">
        <StreamingText
          text={text}
          streamKey={streamKey}
          theme={theme}
          onComplete={onComplete}
        />
        {live && accent && (
          <span style={{ marginLeft: 8 }}>
            <LiveDot accent={accent} />
          </span>
        )}
      </p>
    </section>
  );
}
