"use client";

import { Theme } from "./theme";

export function SpeakerButton({
  active,
  disabled,
  onClick,
  theme,
  label = "Listen",
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  theme: Theme;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`speaker-btn${active ? " speaker-btn--active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={active ? "Stop reading" : label}
      title={active ? "Stop" : label}
      style={{
        borderColor: active ? theme.accent : theme.edge,
        color: active ? theme.accent : "var(--ink-dim)",
        background: active ? theme.accentSoft : "rgba(0,0,0,0.28)",
      }}
    >
      {active ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" />
          <path
            d="M15.5 8.5a5 5 0 010 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18 6a8.5 8.5 0 010 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      )}
    </button>
  );
}
