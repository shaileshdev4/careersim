"use client";

import { useId } from "react";

/** One cardiac cycle - baseline y=50, width 168 (seamless loop). */
const BEAT_D =
  "M0 50 H24 L28 47 L32 50 H40 L41 50 L43 26 L45 74 L47 36 L49 54 L53 50 L57 47 L61 50 H168";

function BeatSvg({
  accent,
  glowId,
  mainOpacity,
}: {
  accent: string;
  glowId: string;
  mainOpacity: number;
}) {
  const beat2 = BEAT_D.replace(/^M0/, "M168");

  return (
    <svg viewBox="0 0 336 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <filter id={glowId} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* ECG paper grid */}
      <g stroke={accent} strokeOpacity={0.06} strokeWidth="0.4">
        {Array.from({ length: 25 }, (_, i) => (
          <line key={`v${i}`} x1={i * 14} y1="0" x2={i * 14} y2="100" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 14} x2="336" y2={i * 14} />
        ))}
      </g>
      <path
        d={`${BEAT_D} ${beat2}`}
        stroke={accent}
        strokeOpacity={mainOpacity}
        fill="none"
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />
    </svg>
  );
}

/** Hospital-monitor style scrolling ECG (two bands, seamless loop). */
export function EkgMonitor({ accent }: { accent: string }) {
  const uid = useId().replace(/:/g, "");
  const glowA = `${uid}-ga`;
  const glowB = `${uid}-gb`;
  const fadeId = `${uid}-fade`;

  return (
    <div className="ekg-monitor">
      <div className="ekg-monitor__band ekg-monitor__band--upper">
        <div className="ekg-monitor__viewport">
          <div className="ekg-monitor__roll">
            <BeatSvg accent={accent} glowId={glowA} mainOpacity={0.22} />
            <BeatSvg accent={accent} glowId={glowA} mainOpacity={0.22} />
          </div>
          <svg className="ekg-monitor__fade" aria-hidden>
            <defs>
              <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
                <stop offset="18%" stopColor="#000" stopOpacity="0" />
                <stop offset="82%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${fadeId})`} />
          </svg>
        </div>
      </div>
      <div className="ekg-monitor__band ekg-monitor__band--lower">
        <div className="ekg-monitor__viewport">
          <div className="ekg-monitor__roll ekg-monitor__roll--slow">
            <BeatSvg accent={accent} glowId={glowB} mainOpacity={0.16} />
            <BeatSvg accent={accent} glowId={glowB} mainOpacity={0.16} />
          </div>
          <svg className="ekg-monitor__fade" aria-hidden>
            <rect width="100%" height="100%" fill={`url(#${fadeId})`} />
          </svg>
        </div>
      </div>
    </div>
  );
}
