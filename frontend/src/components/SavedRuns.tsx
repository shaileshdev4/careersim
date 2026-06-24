"use client";

import { useEffect, useState } from "react";
import { SavedRunRecord } from "@careersim/engine";
import { CAREERS } from "@careersim/engine";
import { LogoMark } from "./Logo";
import { careerAmbientUrl } from "./careerAmbient";
import {
  loadRunHistory,
  deleteRunRecord,
  clearRunHistory,
  downloadReport,
  copyReport,
} from "./useRunHistory";

export function SavedRunsPanel({
  onBack,
  refreshKey = 0,
}: {
  onBack: () => void;
  refreshKey?: number;
}) {
  const [runs, setRuns] = useState<SavedRunRecord[]>(() => loadRunHistory());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setRuns(loadRunHistory());
  }, [refreshKey]);

  const onDelete = (id: string) => {
    deleteRunRecord(id);
    setRuns(loadRunHistory());
    if (expandedId === id) setExpandedId(null);
  };

  const onCopy = async (r: SavedRunRecord) => {
    await copyReport(r);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="scene-in landing-section">
      <div className="landing-section__head landing-runs__head">
        <div className="landing-runs__title-row">
          <LogoMark size={18} />
          <h2 className="display landing-section__title">Saved runs</h2>
        </div>
        <button type="button" className="landing-link" onClick={onBack}>
          ← Back to careers
        </button>
      </div>
      {runs.length === 0 ? (
        <p className="dim">No saved runs yet. Finish a day to see it here.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {runs.map((r) => {
              const career = CAREERS[r.careerId];
              const accent = career?.mood.accent ?? "var(--ink)";
              const expanded = expandedId === r.id;
              return (
                <SavedRunRow
                  key={r.id}
                  run={r}
                  accent={accent}
                  expanded={expanded}
                  copied={copiedId === r.id}
                  onToggle={() => setExpandedId(expanded ? null : r.id)}
                  onDelete={() => onDelete(r.id)}
                  onCopy={() => onCopy(r)}
                  onDownload={() => downloadReport(r)}
                />
              );
            })}
          </ul>
          <button
            type="button"
            className="landing-cta"
            style={{ marginTop: 16, alignSelf: "flex-start" }}
            onClick={() => {
              clearRunHistory();
              setRuns([]);
            }}
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

function SavedRunRow({
  run,
  accent,
  expanded,
  copied,
  onToggle,
  onDelete,
  onCopy,
  onDownload,
}: {
  run: SavedRunRecord;
  accent: string;
  expanded: boolean;
  copied: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <li className="surface-card surface-card--muted" style={{ padding: "12px 14px", borderRadius: 12 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span style={{ color: accent, fontWeight: 600 }}>{run.careerTitle}</span>
        <span className="faint" style={{ marginLeft: 8, fontSize: 12 }}>
          {run.arcComplete ? "arc done" : `day ${run.daysPlayed}`}
        </span>
        <div className="dim" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>
          {run.patternSummary}
        </div>
      </button>
      {expanded && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="landing-cta" onClick={onCopy}>
            {copied ? "Copied" : "Copy report"}
          </button>
          <button type="button" className="landing-cta" onClick={onDownload}>
            Download
          </button>
          <button type="button" className="landing-cta" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export function SavedRunsPreview({
  onViewAll,
  refreshKey = 0,
}: {
  onViewAll: () => void;
  refreshKey?: number;
}) {
  const [runs, setRuns] = useState(() => loadRunHistory());

  useEffect(() => {
    setRuns(loadRunHistory());
  }, [refreshKey]);

  if (runs.length === 0) return null;

  return (
    <section className="landing-runs scene-in">
      <div className="landing-section__head landing-runs__head">
        <div className="landing-runs__title-row">
          <LogoMark size={18} />
          <h2 className="display landing-section__title">Saved runs</h2>
        </div>
        <button type="button" className="landing-link" onClick={onViewAll}>
          View all ({runs.length}) →
        </button>
      </div>
      <ul className="landing-runs__list">
        {runs.slice(0, 3).map((r) => {
          const career = CAREERS[r.careerId];
          const accent = career?.mood.accent ?? "var(--ink)";
          const photo = careerAmbientUrl(r.careerId);
          return (
            <li key={r.id} className="landing-run-chip">
              {photo && (
                <span
                  className="landing-run-chip__thumb"
                  style={{ backgroundImage: `url(${photo})` }}
                  aria-hidden
                />
              )}
              <span className="landing-run-chip__text">
                <span style={{ color: accent, fontWeight: 600 }}>
                  {r.careerTitle}
                </span>
                <span className="faint" style={{ marginLeft: 6, fontSize: 11 }}>
                  {r.arcComplete ? "arc done" : `day ${r.daysPlayed}`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
