"use client";

export function ToggleSwitch({
  label,
  value,
  onChange,
  title,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  title?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 12,
      }}
      className="dim"
      title={title}
    >
      <span className="eyebrow" style={{ fontSize: 10 }}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={{
          width: 34,
          height: 19,
          borderRadius: 12,
          padding: 2,
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
          background: value ? "var(--accent, #888)" : "rgba(255,255,255,0.18)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: value ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: 8,
            background: "#fff",
          }}
        />
      </button>
    </label>
  );
}
