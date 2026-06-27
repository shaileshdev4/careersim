"use client";

export function LiveDot({
  accent,
  label = "live",
}: {
  accent: string;
  label?: string;
}) {
  return (
    <span className="live-dot-inline">
      <span className="live-dot-inline__dot pulse-dot" style={{ background: accent }} />
      <span className="eyebrow faint" style={{ fontSize: 9 }}>
        {label}
      </span>
    </span>
  );
}
