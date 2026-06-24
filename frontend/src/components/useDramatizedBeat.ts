"use client";

import { useEffect, useRef, useState } from "react";
import { Beat, Career, DayState } from "@careersim/engine";
import { DramatizedBeat } from "@careersim/engine";
import { fallbackDramatization } from "@careersim/engine";

// ============================================================================
// useDramatizedBeat
// ----------------------------------------------------------------------------
// The scene renders IMMEDIATELY from the authored beat (zero latency). If live
// generation is enabled, we fetch a re-dramatized version in the background and
// swap it in only if it arrives and validates server-side. The player never
// waits on the network; a failed call simply means the authored text stays.
// ============================================================================
export function useDramatizedBeat(
  career: Career,
  beat: Beat | null,
  state: DayState,
  liveEnabled: boolean,
): { content: DramatizedBeat | null; upgrading: boolean } {
  const [content, setContent] = useState<DramatizedBeat | null>(
    beat ? fallbackDramatization(beat) : null,
  );
  const [upgrading, setUpgrading] = useState(false);
  const beatIdRef = useRef<string | null>(beat?.id ?? null);

  useEffect(() => {
    if (!beat) {
      setContent(null);
      return;
    }
    // Instant authored render on every beat change.
    beatIdRef.current = beat.id;
    setContent(fallbackDramatization(beat));

    if (!liveEnabled) return;

    let cancelled = false;
    setUpgrading(true);
    const controller = new AbortController();

    fetch("/api/dramatize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careerId: career.id, beatId: beat.id, state }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d: DramatizedBeat) => {
        // Only apply if we're still on the same beat and it's a real upgrade.
        if (cancelled || beatIdRef.current !== beat.id) return;
        if (d && d.source === "model" && typeof d.scene === "string") {
          setContent(d);
        }
      })
      .catch(() => {
        /* stay on authored fallback -by design */
      })
      .finally(() => {
        if (!cancelled) setUpgrading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat?.id, liveEnabled, career.id]);

  return { content, upgrading };
}
