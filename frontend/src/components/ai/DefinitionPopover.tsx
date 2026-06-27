"use client";

import { useEffect, useRef } from "react";
import { Theme } from "../theme";
import { LiveDot } from "./LiveDot";

export function DefinitionPopover({
  term,
  definition,
  source,
  loading,
  theme,
  onClose,
  anchorRef,
}: {
  term: string;
  definition: string | null;
  source: "model" | "fallback" | null;
  loading: boolean;
  theme: Theme;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let leaveTimer: number | undefined;
    const onMove = (e: MouseEvent) => {
      const pop = popRef.current;
      const anchor = anchorRef.current;
      if (!pop || !anchor) return;
      const inPop = pop.contains(e.target as Node);
      const inAnchor = anchor.contains(e.target as Node);
      if (!inPop && !inAnchor) {
        if (!leaveTimer) {
          leaveTimer = window.setTimeout(onClose, 300);
        }
      } else if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = undefined;
      }
    };
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      if (leaveTimer) window.clearTimeout(leaveTimer);
    };
  }, [anchorRef, onClose]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        const anchor = anchorRef.current;
        if (anchor && anchor.contains(e.target as Node)) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [anchorRef, onClose]);

  if (!definition) return null;

  return (
    <div
      ref={popRef}
      className="defn-popover ai-surface"
      role="dialog"
      aria-label={`Definition of ${term}`}
      style={{
        borderColor: theme.edge,
        ["--accent" as string]: theme.accent,
      }}
    >
      <div className="eyebrow defn-popover__eyebrow" style={{ color: theme.accent }}>
        definition · {term}
      </div>
      <p className="defn-popover__body">{definition}</p>
      <div className="defn-popover__foot">
        {loading && <span className="faint" style={{ fontSize: 10 }}>…</span>}
        {source === "model" && !loading && (
          <LiveDot accent={theme.accent} label="live" />
        )}
      </div>
    </div>
  );
}
