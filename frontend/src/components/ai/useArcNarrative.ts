"use client";

import { useCallback, useEffect, useState } from "react";
import { Career, RunResult, ArcNarrativeParagraphs } from "@careersim/engine";
import { fallbackArcNarrative, buildArcNarrativePayload } from "@careersim/engine";
import { aiCacheKey, readAiCache, writeAiCache } from "./useAiCache";

export function useArcNarrative({
  career,
  days,
  liveEnabled,
}: {
  career: Career;
  days: RunResult[];
  liveEnabled: boolean;
}) {
  const [narrative, setNarrative] = useState<ArcNarrativeParagraphs | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const cacheKey = aiCacheKey([
    "arc-narrative",
    career.id,
    String(days.length),
    days.map((d) => d.transcript.length).join("-"),
  ]);

  const load = useCallback(async () => {
    const payload = buildArcNarrativePayload(career, days);
    const fb = fallbackArcNarrative(payload);

    const cached = readAiCache<ArcNarrativeParagraphs>(cacheKey);
    if (cached) {
      setNarrative(cached);
      return;
    }

    setNarrative(fb);
    if (!liveEnabled) return;

    setLoading(true);
    try {
      const res = await fetch("/api/arc-narrative", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ careerId: career.id, days }),
      });
      if (res.ok) {
        const data = (await res.json()) as ArcNarrativeParagraphs;
        setNarrative(data);
        writeAiCache(cacheKey, data);
      }
    } catch {
      /* keep fallback */
    } finally {
      setLoading(false);
    }
  }, [cacheKey, career, days, liveEnabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { narrative, loading, payload: buildArcNarrativePayload(career, days) };
}
