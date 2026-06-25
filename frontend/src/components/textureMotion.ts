import { Theme } from "./theme";

export type BgPattern =
  | "none"
  | "ekg"
  | "grid"
  | "circuit"
  | "geometry"
  | "wave"
  | "scanlines"
  | "rings"
  | "static"
  | "bloom";

/** Phase 1 - motion profile per authored career texture. */
export function textureMotionVars(texture: string, tempo: number) {
  const baseDrift = 22 + (1 - tempo) * 18;
  const baseShimmer = 14 + (1 - tempo) * 10;

  switch (texture) {
    case "tense":
      return {
        driftS: baseDrift * 0.62,
        shimmerS: baseShimmer * 0.75,
        orbOpacity: 0.48,
        orbBlur: 68,
      };
    case "quiet":
      return {
        driftS: baseDrift * 1.75,
        shimmerS: baseShimmer * 1.6,
        orbOpacity: 0.32,
        orbBlur: 96,
      };
    case "frantic":
      return {
        driftS: baseDrift * 0.48,
        shimmerS: baseShimmer * 0.55,
        orbOpacity: 0.5,
        orbBlur: 64,
      };
    case "grinding":
      return {
        driftS: baseDrift * 1.35,
        shimmerS: baseShimmer * 1.2,
        orbOpacity: 0.38,
        orbBlur: 80,
      };
    case "urgent":
      return {
        driftS: baseDrift * 0.58,
        shimmerS: baseShimmer * 0.7,
        orbOpacity: 0.46,
        orbBlur: 70,
      };
    case "wired":
      return {
        driftS: baseDrift * 0.42,
        shimmerS: baseShimmer * 0.35,
        orbOpacity: 0.44,
        orbBlur: 62,
      };
    case "weighted":
      return {
        driftS: baseDrift * 1.55,
        shimmerS: baseShimmer * 1.45,
        orbOpacity: 0.36,
        orbBlur: 92,
      };
    case "iterative":
      return {
        driftS: baseDrift * 1.15,
        shimmerS: baseShimmer * 0.95,
        orbOpacity: 0.4,
        orbBlur: 84,
      };
  }

  return {
    driftS: baseDrift,
    shimmerS: baseShimmer,
    orbOpacity: 0.42,
    orbBlur: 72,
  };
}

/** Phase 2 - SVG overlay pattern per texture. */
export function texturePattern(texture: string): BgPattern {
  switch (texture) {
    case "tense":
      return "ekg";
    case "quiet":
      return "circuit";
    case "iterative":
      return "geometry";
    case "frantic":
      return "wave";
    case "grinding":
      return "scanlines";
    case "urgent":
      return "rings";
    case "wired":
      return "static";
    case "weighted":
      return "bloom";
  }
  return "none";
}

export function liveBgClass(theme: Theme): string {
  const tex = theme.texture.replace(/[^a-z0-9-]/gi, "");
  return `live-bg live-bg--${tex || "open"}`;
}
