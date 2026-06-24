"use client";

import type { CSSProperties } from "react";

/** Brand mark - day arc, horizon, choice dot. Works from 16px favicon to header. */
export function LogoMark({
  size = 28,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#0c0e14" />
      <path
        d="M6 22 H26"
        stroke="rgba(243,244,247,0.22)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M7 22 C11 10, 21 10, 25 22"
        stroke="url(#logo-arc)"
        strokeWidth="2.25"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="13.5" r="2.75" fill="#5eead4" />
      <circle cx="16" cy="13.5" r="4.5" fill="#5eead4" fillOpacity="0.18" />
      <defs>
        <linearGradient id="logo-arc" x1="7" y1="22" x2="25" y2="10">
          <stop stopColor="#f0a962" />
          <stop offset="0.45" stopColor="#8b8ff5" />
          <stop offset="1" stopColor="#5eead4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  size = "md",
  showBack,
  className,
  style,
}: {
  size?: "sm" | "md" | "lg";
  showBack?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const markSize = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const fontSize = size === "sm" ? 14 : size === "lg" ? 18 : 15;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? 8 : 10,
        ...style,
      }}
    >
      <LogoMark size={markSize} />
      <span
        className="display"
        style={{
          fontSize,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "var(--ink)",
        }}
      >
        A Day In
        {showBack && (
          <span style={{ opacity: 0.45, marginLeft: 4, fontWeight: 500 }}>
            ←
          </span>
        )}
      </span>
    </span>
  );
}
