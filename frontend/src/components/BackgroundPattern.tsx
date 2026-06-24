"use client";

import { useId } from "react";
import type { BgPattern } from "./textureMotion";
import { EkgMonitor } from "./EkgMonitor";
import { WaveMonitor } from "./WaveMonitor";
import { PAT, PAT_FULL } from "./patternStyles";

/** Phase 2 - career-texture SVG overlays (visible but ambient). */
export function BackgroundPattern({
  pattern,
  accent,
}: {
  pattern: BgPattern;
  accent: string;
}) {
  const patternId = useId().replace(/:/g, "");
  if (pattern === "none") return null;

  if (pattern === "ekg") {
    return (
      <div className="live-bg__pattern-wrap live-bg__pattern-wrap--ekg">
        <EkgMonitor accent={accent} />
      </div>
    );
  }

  if (pattern === "wave") {
    return (
      <div className="live-bg__pattern-wrap live-bg__pattern-wrap--wave">
        <WaveMonitor accent={accent} />
      </div>
    );
  }

  return (
    <div className={`live-bg__pattern-wrap live-bg__pattern-wrap--${pattern}`}>
      {pattern === "grid" && (
        <svg
          className="live-bg__pattern live-bg__pattern--grid"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <pattern
              id={patternId}
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="5"
                cy="5"
                r="1.25"
                fill={accent}
                fillOpacity={PAT.grid}
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#${patternId})`} />
        </svg>
      )}

      {pattern === "geometry" && (
        <svg
          className="live-bg__pattern live-bg__pattern--geometry"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <rect
            x="28"
            y="36"
            width="104"
            height="104"
            rx="26"
            stroke={accent}
            strokeOpacity={PAT.line}
            fill="none"
            strokeWidth="1.5"
          />
          <circle
            cx="300"
            cy="72"
            r="52"
            stroke={accent}
            strokeOpacity={PAT.soft}
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="M148 188 L236 118 L328 196 Z"
            stroke={accent}
            strokeOpacity={PAT.line}
            fill={accent}
            fillOpacity={PAT.fill}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect
            x="198"
            y="168"
            width="72"
            height="72"
            rx="18"
            stroke={accent}
            strokeOpacity={PAT.soft}
            fill="none"
            strokeWidth="1.5"
          />
          <circle
            cx="88"
            cy="228"
            r="28"
            stroke={accent}
            strokeOpacity={PAT.soft}
            fill={accent}
            fillOpacity={PAT.fill * 0.6}
            strokeWidth="1"
          />
        </svg>
      )}

      {pattern === "scanlines" && (
        <svg
          className="live-bg__pattern live-bg__pattern--scanlines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {Array.from({ length: 32 }, (_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 3.15 + 0.5}
              x2="100"
              y2={i * 3.15 + 0.5}
              stroke={accent}
              strokeOpacity={i % 3 === 0 ? PAT_FULL.line : PAT_FULL.soft}
              strokeWidth="0.55"
            />
          ))}
        </svg>
      )}

      {pattern === "rings" && (
        <svg
          className="live-bg__pattern live-bg__pattern--rings"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {[28, 48, 68, 88].map((r, i) => (
            <circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              stroke={accent}
              strokeOpacity={PAT.line - i * 0.035}
              fill="none"
              strokeWidth="1.75"
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="4"
            fill={accent}
            fillOpacity={PAT.line}
          />
        </svg>
      )}

      {pattern === "static" && (
        <svg
          className="live-bg__pattern live-bg__pattern--static"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          {Array.from({ length: 56 }, (_, i) => (
            <line
              key={i}
              x1={(i * 17) % 200}
              y1="0"
              x2={(i * 11 + 36) % 200}
              y2="200"
              stroke={accent}
              strokeOpacity={i % 4 === 0 ? PAT_FULL.line : PAT_FULL.soft}
              strokeWidth="0.8"
            />
          ))}
        </svg>
      )}

      {pattern === "bloom" && (
        <svg
          className="live-bg__pattern live-bg__pattern--bloom"
          viewBox="0 0 300 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          {[
            [72, 112, 62],
            [210, 82, 48],
            [148, 218, 78],
            [260, 200, 36],
          ].map(([cx, cy, r], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill={accent}
              fillOpacity={PAT.line - i * 0.035}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
