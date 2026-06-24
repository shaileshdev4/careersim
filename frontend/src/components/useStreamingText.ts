"use client";

import { useEffect, useRef, useState } from "react";

/** Ms between each character - higher tempo = faster type. */
function msPerChar(tempo: number): number {
  return 38 - tempo * 22; // ~38ms (slow) → ~16ms (fast)
}

/** Extra pause after punctuation so it reads naturally. */
function pauseAfterChar(char: string, tempo: number): number {
  if (/[.!?]/.test(char)) return 220 + (1 - tempo) * 180;
  if (/[,:;]/.test(char)) return 90 + (1 - tempo) * 70;
  if (char === "\n") return 80;
  return 0;
}

export function useStreamingText(
  text: string,
  opts: { streamKey: string; tempo: number; onComplete?: () => void },
) {
  const [displayed, setDisplayed] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const onCompleteRef = useRef(opts.onComplete);
  onCompleteRef.current = opts.onComplete;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!text) {
      setDisplayed("");
      setIsStreaming(false);
      onCompleteRef.current?.();
      return;
    }

    if (reduced) {
      setDisplayed(text);
      setIsStreaming(false);
      onCompleteRef.current?.();
      return;
    }

    let cancelled = false;
    let raf = 0;
    let index = 0;
    let acc = 0;
    let pauseLeft = 0;
    let lastTs = 0;
    const charDelay = msPerChar(opts.tempo);

    setDisplayed("");
    setIsStreaming(true);

    const frame = (ts: number) => {
      if (cancelled) return;
      if (!lastTs) lastTs = ts;
      const delta = Math.min(ts - lastTs, 48);
      lastTs = ts;

      if (pauseLeft > 0) {
        pauseLeft -= delta;
        raf = requestAnimationFrame(frame);
        return;
      }

      acc += delta;
      while (acc >= charDelay && index < text.length) {
        acc -= charDelay;
        index += 1;
        const ch = text[index - 1];
        pauseLeft = pauseAfterChar(ch, opts.tempo);
        if (pauseLeft > 0) break;
      }

      const slice = text.slice(0, index);
      setDisplayed(slice);

      if (index >= text.length) {
        setIsStreaming(false);
        onCompleteRef.current?.();
        return;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [text, opts.streamKey, opts.tempo]);

  return { displayed, isStreaming };
}
