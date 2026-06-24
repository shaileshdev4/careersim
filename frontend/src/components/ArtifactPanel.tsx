"use client";

import { useState } from "react";
import { Artifact } from "@careersim/engine";
import { Theme } from "./theme";

export function ArtifactPanel({
  artifacts,
  theme,
}: {
  artifacts: Artifact[];
  theme: Theme;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = artifacts.find((a) => a.id === openId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="eyebrow faint" style={{ fontSize: 10 }}>
        Inspect before you decide
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {artifacts.map((a) => (
          <button
            key={a.id}
            type="button"
            className="choice-btn"
            style={{
              width: "auto",
              fontSize: 12,
              borderColor: openId === a.id ? theme.accent : undefined,
            }}
            onClick={() => setOpenId(openId === a.id ? null : a.id)}
          >
            {a.title}
          </button>
        ))}
      </div>
      {open && (
        <pre
          className="scene-in dim"
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            margin: 0,
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${theme.edge}`,
            background: "rgba(0,0,0,0.28)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {open.body}
        </pre>
      )}
    </div>
  );
}
