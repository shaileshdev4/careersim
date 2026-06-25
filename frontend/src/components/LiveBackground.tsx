"use client";

import type { CSSProperties } from "react";
import { Theme } from "./theme";
import { BackgroundPattern } from "./BackgroundPattern";
import { ParticleCanvas } from "./ParticleCanvas";
import {
  liveBgClass,
  textureMotionVars,
  texturePattern,
} from "./textureMotion";
import {
  careerAmbientUrl,
  careerAmbientStyle,
} from "./careerAmbient";

export type SimAmbient = {
  active: boolean;
  /** Play screen gets a tighter, more recessive photo treatment. */
  play?: boolean;
  careerId?: string | null;
  energy?: number;
  phase?: string | null;
};

/**
 * Ambient live stage - texture-tuned orbs, shimmer, SVG patterns, and particles.
 */
export function LiveBackground({
  theme,
  sim,
}: {
  theme: Theme;
  sim?: SimAmbient;
}) {
  const motion = textureMotionVars(theme.texture, theme.tempo);
  const pattern = texturePattern(theme.texture);
  const simActive = sim?.active ?? false;
  const simPlay = sim?.play ?? false;
  const photoUrl =
    simActive && sim?.careerId ? careerAmbientUrl(sim.careerId) : null;
  const photoStyle = careerAmbientStyle(sim?.careerId);

  return (
    <div
      className={`${liveBgClass(theme)}${photoUrl ? " live-bg--photo" : ""}${simPlay ? " live-bg--play" : ""}`}
      aria-hidden
      style={
        {
          "--bg": theme.bg,
          "--glow": theme.glow,
          "--orb-a": theme.accent,
          "--orb-b": theme.glow,
          "--orb-c": theme.accentSoft,
          "--drift-s": `${motion.driftS}s`,
          "--shimmer-s": `${motion.shimmerS}s`,
          "--orb-opacity": motion.orbOpacity,
          "--orb-blur": `${motion.orbBlur}px`,
          "--pattern-opacity": pattern === "none" ? 0 : 1,
          "--photo-position": photoStyle.position ?? "center",
          "--photo-scale": String(1.05 * (photoStyle.scale ?? 1)),
          "--photo-strength": String(photoStyle.opacity ?? 1),
        } as CSSProperties
      }
    >
      {photoUrl && (
        <div
          className="live-bg__photo"
          style={{ backgroundImage: `url(${photoUrl})` }}
        />
      )}
      <div className="live-bg__base" />
      {photoUrl && <div className="live-bg__scrim" aria-hidden />}
      <div className="live-bg__grain" />
      <div className="live-bg__orb live-bg__orb--1" />
      <div className="live-bg__orb live-bg__orb--2" />
      <div className="live-bg__orb live-bg__orb--3" />
      <ParticleCanvas
        theme={theme}
        active={simActive}
        energy={sim?.energy ?? 100}
        phase={sim?.phase ?? null}
      />
      <BackgroundPattern pattern={pattern} accent={theme.accent} />
      <div className="live-bg__shimmer" />
    </div>
  );
}
