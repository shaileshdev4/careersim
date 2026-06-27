import type { CSSProperties } from "react";
import { Career } from "@careersim/engine";

// ============================================================================
// THEME -translate a career's authored `mood` into concrete CSS + motion.
// Surface B (cinematic): deep gradient base, subtle grain, corner accent glow.
// Tempo-as-character: every animation duration derives from mood.tempo, so the
// surgeon's day moves briskly and the engineer's languidly -the signature.
// ============================================================================

export interface Theme {
  accent: string;
  accentSoft: string; // translucent accent for fills
  edge: string; // translucent accent for borders
  glow: string; // corner vignette glow
  bg: string; // gradient background
  texture: string;
  tempo: number; // 0 (languid) .. 1 (frantic)
  // Derived motion timings (ms / s) used across the UI.
  clockTickMs: number; // how often the clock visibly "breathes"
  transitionS: number; // scene transition duration
  meterEaseS: number; // meter fill animation
  jitter: number; // 0..1 nervous micro-motion (teacher high, engineer ~0)
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function themeFor(career: Career): Theme {
  const { accent, bgFrom, bgTo, texture, tempo } = career.mood;
  // Higher tempo -> faster, tighter motion.
  const transitionS = lerp(0.85, 0.32, tempo); // languid 0.85s -> frantic 0.32s
  const meterEaseS = lerp(1.1, 0.45, tempo);
  const clockTickMs = Math.round(lerp(2600, 1100, tempo));
  // Jitter: only the genuinely frantic careers (teacher) get nervous motion.
  const jitter = clamp01((tempo - 0.7) / 0.3); // 0 below 0.7, ramps to 1 at 1.0

  return {
    accent,
    accentSoft: rgba(accent, 0.16),
    edge: rgba(accent, 0.24),
    glow: rgba(accent, 0.14),
    bg: `linear-gradient(158deg, ${bgFrom} 0%, ${bgTo} 100%)`,
    texture,
    tempo,
    clockTickMs,
    transitionS,
    meterEaseS,
    jitter,
  };
}

// CSS custom properties object to spread onto a styled container.
export function themeVars(t: Theme): React.CSSProperties {
  return {
    "--accent": t.accent,
    "--accent-soft": t.accentSoft,
    "--edge": t.edge,
    "--glow": t.glow,
    "--bg": t.bg,
    "--transition-s": `${t.transitionS}s`,
    "--meter-ease-s": `${t.meterEaseS}s`,
    "--jitter": String(t.jitter),
  } as CSSProperties;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Home / saved-runs palette - brand neutrals, not a career mood. */
export const NEUTRAL_THEME: Theme = {
  accent: "#8b8ff5",
  accentSoft: rgba("#8b8ff5", 0.14),
  edge: rgba("#8b8ff5", 0.22),
  glow: rgba("#5eead4", 0.12),
  bg: "linear-gradient(158deg, #0c0e14 0%, #08080b 55%, #060608 100%)",
  texture: "open",
  tempo: 0.32,
  clockTickMs: 2400,
  transitionS: 0.72,
  meterEaseS: 0.95,
  jitter: 0,
};

export type AppScreen =
  | "select"
  | "play"
  | "debrief"
  | "arcDebrief"
  | "compare"
  | "runs";

/** Pick stage theme from the active screen - home stays neutral even if career state lingers. */
export function resolveStageTheme(
  screen: AppScreen,
  career: Career | null,
): Theme {
  if (screen === "select" || screen === "runs") return NEUTRAL_THEME;
  if (screen === "arcDebrief" && career) return themeFor(career);
  if (career) return themeFor(career);
  return NEUTRAL_THEME;
}
