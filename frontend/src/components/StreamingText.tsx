"use client";

import { useStreamingText } from "./useStreamingText";
import { Theme } from "./theme";

export function StreamingText({
  text,
  streamKey,
  theme,
  className,
  style,
  onComplete,
}: {
  text: string;
  streamKey: string;
  theme: Theme;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}) {
  const { displayed, isStreaming } = useStreamingText(text, {
    streamKey,
    tempo: theme.tempo,
    onComplete,
  });

  const body =
    displayed.length > 0 ? (
      <>
        {displayed.slice(0, -1)}
        <span
          key={displayed.length}
          className={isStreaming ? "stream-tail" : undefined}
        >
          {displayed.slice(-1)}
        </span>
      </>
    ) : null;

  return (
    <span className={className} style={style}>
      {body}
      {isStreaming && (
        <span className="stream-cursor" style={{ color: "var(--accent)" }}>
          ▍
        </span>
      )}
    </span>
  );
}
