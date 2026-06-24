"use client";

/** Shared ambient opacities - visible on dark career gradients, not loud. */
export const PAT = {
  line: 0.2,
  soft: 0.13,
  fill: 0.08,
  grid: 0.16,
} as const;

/** Full-page patterns (analyst scanlines, journalist static) - slightly softer. */
export const PAT_FULL = {
  line: 0.16,
  soft: 0.1,
} as const;
