/** Local ambient photos (from frontend/scripts/fetch-career-photos.mjs). */

export type CareerAmbientStyle = {
  /** CSS background-position */
  position?: string;
  /** Extra scale on top of base cover (1 = default) */
  scale?: number;
  /** Per-career opacity multiplier (1 = default) */
  opacity?: number;
};

export const CAREER_AMBIENT: Record<string, string> = {
  surgeon: "/careers/surgeon-ambient.jpg",
  engineer: "/careers/engineer-ambient.jpg",
  teacher: "/careers/teacher-ambient.jpg",
  analyst: "/careers/analyst-ambient.jpg",
  nurse: "/careers/nurse-ambient.jpg",
  journalist: "/careers/journalist-ambient.jpg",
  socialworker: "/careers/socialworker-ambient.jpg",
  uxdesigner: "/careers/uxdesigner-ambient.jpg",
};

/** Tune crops — UX designer stock art is especially busy at center. */
export const CAREER_AMBIENT_STYLE: Record<string, CareerAmbientStyle> = {
  surgeon: { position: "center 22%", scale: 1.08 },
  teacher: { position: "center 30%", scale: 1.05 },
  uxdesigner: { position: "center 12%", scale: 1.22, opacity: 0.85 },
};

export function careerAmbientUrl(
  careerId: string | null | undefined,
): string | null {
  if (!careerId) return null;
  return CAREER_AMBIENT[careerId] ?? null;
}

export function careerAmbientStyle(
  careerId: string | null | undefined,
): CareerAmbientStyle {
  if (!careerId) return {};
  return CAREER_AMBIENT_STYLE[careerId] ?? {};
}
