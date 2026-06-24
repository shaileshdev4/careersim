"use client";

import { PAT } from "./patternStyles";

function WaveSvg({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 50 Q75 18 150 50 T300 50 T450 50 T600 50"
        stroke={accent}
        strokeOpacity={PAT.line}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M0 68 Q75 92 150 68 T300 68 T450 68 T600 68"
        stroke={accent}
        strokeOpacity={PAT.soft}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Teacher - scrolling wave bands (classroom energy). */
export function WaveMonitor({ accent }: { accent: string }) {
  return (
    <div className="wave-monitor">
      <div className="wave-monitor__band wave-monitor__band--upper">
        <div className="wave-monitor__viewport">
          <div className="wave-monitor__roll">
            <WaveSvg accent={accent} />
            <WaveSvg accent={accent} />
          </div>
        </div>
      </div>
      <div className="wave-monitor__band wave-monitor__band--lower">
        <div className="wave-monitor__viewport">
          <div className="wave-monitor__roll wave-monitor__roll--slow">
            <WaveSvg accent={accent} />
            <WaveSvg accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
}
