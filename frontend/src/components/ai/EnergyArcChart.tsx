"use client";

import { useMemo, useState } from "react";
import { Career, RunResult, buildArcEnergySeries } from "@careersim/engine";
import { Theme } from "../theme";

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function EnergyArcChart({
  career,
  days,
  theme,
}: {
  career: Career;
  days: RunResult[];
  theme: Theme;
}) {
  const series = useMemo(
    () => buildArcEnergySeries(career, days),
    [career, days],
  );

  const { path, minIdx, width, height, points } = useMemo(() => {
    const w = 800;
    const h = 72;
    const pad = 8;
    if (series.length === 0) {
      return {
        path: "",
        minIdx: 0,
        width: w,
        height: h,
        points: [] as Array<{ x: number; y: number }>,
      };
    }
    const minE = Math.min(...series.map((s) => s.energy));
    const maxE = Math.max(...series.map((s) => s.energy), 100);
    const range = Math.max(maxE - minE, 20);
    const pts = series.map((s, i) => {
      const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
      const y = pad + (1 - (s.energy - minE) / range) * (h - pad * 2);
      return { x, y, energy: s.energy, day: s.day, label: s.label };
    });
    const d = pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ");
    let minIdx = 0;
    series.forEach((s, i) => {
      if (s.energy <= series[minIdx].energy) minIdx = i;
    });
    return { path: d, minIdx, width: w, height: h, points: pts };
  }, [series]);

  const [tip, setTip] = useState(false);
  const minPoint = points[minIdx];
  const minDay = Math.floor(series[minIdx]?.day ?? 1);
  const floorLabel = series[minIdx]?.label
    ? `your floor - ${series[minIdx]!.label}`
    : `your floor - ${DAY_NAMES[minDay] ?? `day ${minDay}`} afternoon`;

  const dayDividers = useMemo(() => {
    const daysSeen = new Set<number>();
    const lines: number[] = [];
    series.forEach((s, i) => {
      const d = Math.floor(s.day);
      if (!daysSeen.has(d) && daysSeen.size > 0) {
        lines.push(i);
      }
      daysSeen.add(d);
    });
    return lines;
  }, [series]);

  if (series.length === 0) return null;

  return (
    <div className="arc-energy-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="arc-energy-chart__svg"
        aria-hidden
      >
        {dayDividers.map((idx) => {
          const x = points[idx]?.x ?? 0;
          return (
            <line
              key={idx}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}
        <path
          d={path}
          fill="none"
          stroke={theme.accent}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {minPoint && (
          <circle
            cx={minPoint.x}
            cy={minPoint.y}
            r={5}
            fill={theme.accent}
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
          />
        )}
      </svg>
      {tip && minPoint && (
        <div
          className="arc-energy-chart__tip ai-surface"
          style={{
            borderColor: theme.edge,
            left: `${(minPoint.x / width) * 100}%`,
          }}
        >
          {floorLabel}
        </div>
      )}
    </div>
  );
}
