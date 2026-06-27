"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Beat, GlossaryTerm } from "@careersim/engine";
import { Theme } from "../theme";
import { StreamingText } from "../StreamingText";
import { DefinitionPopover } from "./DefinitionPopover";
import { useDefinition } from "./useDefinition";

type Segment =
  | { type: "text"; value: string }
  | { type: "term"; value: string; entry: GlossaryTerm };

function buildSegments(text: string, glossary: GlossaryTerm[]): Segment[] {
  if (!glossary.length) return [{ type: "text", value: text }];

  const sorted = [...glossary].sort(
    (a, b) => b.anchor_text.length - a.anchor_text.length,
  );
  const segments: Segment[] = [];
  let i = 0;
  while (i < text.length) {
    let matched: { entry: GlossaryTerm; index: number } | null = null;
    for (const entry of sorted) {
      const idx = text.indexOf(entry.anchor_text, i);
      if (idx === i) {
        matched = { entry, index: idx };
        break;
      }
    }
    if (matched) {
      segments.push({
        type: "term",
        value: matched.entry.anchor_text,
        entry: matched.entry,
      });
      i += matched.entry.anchor_text.length;
      continue;
    }
    const nextIdx = sorted
      .map((g) => text.indexOf(g.anchor_text, i))
      .filter((n) => n >= 0)
      .sort((a, b) => a - b)[0];
    const end = nextIdx === undefined ? text.length : nextIdx;
    segments.push({ type: "text", value: text.slice(i, end) });
    i = end;
  }
  return segments;
}

export function GlossarySceneText({
  text,
  streamKey,
  theme,
  beat,
  careerId,
  liveEnabled,
  onComplete,
  className,
  style,
}: {
  text: string;
  streamKey: string;
  theme: Theme;
  beat: Beat;
  careerId: string;
  liveEnabled: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [sceneReady, setSceneReady] = useState(false);
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const glossary = beat.glossary ?? [];
  const segments = useMemo(
    () => (sceneReady ? buildSegments(text, glossary) : []),
    [sceneReady, text, glossary],
  );

  const fallback =
    activeTerm?.fallback ??
    `${activeTerm?.term ?? ""} is jargon from this job - you'll learn it by doing.`;

  const { definition, source, loading, fetchDef } = useDefinition({
    careerId,
    beatId: beat.id,
    term: activeTerm?.term ?? "",
    fallback,
    liveEnabled,
  });

  const openTerm = useCallback((entry: GlossaryTerm) => {
    setActiveTerm(entry);
  }, []);

  useEffect(() => {
    if (activeTerm) void fetchDef();
  }, [activeTerm, fetchDef]);

  if (!sceneReady) {
    return (
      <StreamingText
        text={text}
        streamKey={streamKey}
        theme={theme}
        className={className}
        style={style}
        onComplete={() => {
          setSceneReady(true);
          onComplete?.();
        }}
      />
    );
  }

  return (
    <span className={className} style={style}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span key={i} className="defn-wrap">
            <button
              type="button"
              ref={activeTerm?.term === seg.entry.term ? btnRef : undefined}
              className="defn"
              style={{ color: "inherit", ["--accent" as string]: theme.accent }}
              onClick={() => openTerm(seg.entry)}
            >
              {seg.value}
              <sup className="defn__mark">?</sup>
            </button>
            {activeTerm?.term === seg.entry.term && (
              <DefinitionPopover
                term={seg.entry.term}
                definition={definition}
                source={source}
                loading={loading}
                theme={theme}
                onClose={() => setActiveTerm(null)}
                anchorRef={btnRef}
              />
            )}
          </span>
        ),
      )}
    </span>
  );
}
