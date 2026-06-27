"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GlossaryTerm } from "@careersim/engine";
import { aiCacheKey, readAiCache, writeAiCache } from "./useAiCache";

export function useDefinition({
  careerId,
  beatId,
  term,
  fallback,
  liveEnabled,
}: {
  careerId: string;
  beatId: string;
  term: string;
  fallback: string;
  liveEnabled: boolean;
}) {
  const [definition, setDefinition] = useState<string | null>(null);
  const [source, setSource] = useState<"model" | "fallback" | null>(null);
  const [loading, setLoading] = useState(false);

  const cacheKey = aiCacheKey(["define", careerId, beatId, term]);

  useEffect(() => {
    setDefinition(null);
    setSource(null);
    setLoading(false);
  }, [term, beatId, careerId]);

  const fetchDef = useCallback(async () => {
    const cached = readAiCache<{ definition: string; source: "model" | "fallback" }>(
      cacheKey,
    );
    if (cached) {
      setDefinition(cached.definition);
      setSource(cached.source);
      return;
    }

    setDefinition(fallback);
    setSource("fallback");
    if (!liveEnabled) return;

    setLoading(true);
    const controller = new AbortController();
    const fastFallback = window.setTimeout(() => {
      setLoading(false);
    }, 600);

    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ careerId, beatId, term }),
        signal: controller.signal,
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.definition) {
        setDefinition(data.definition);
        setSource(data.source ?? "model");
        writeAiCache(cacheKey, {
          definition: data.definition,
          source: data.source ?? "model",
        });
      }
    } catch {
      /* keep fallback */
    } finally {
      window.clearTimeout(fastFallback);
      setLoading(false);
    }
  }, [beatId, cacheKey, careerId, fallback, liveEnabled, term]);

  return { definition, source, loading, fetchDef };
}

export function findGlossaryTerm(
  glossary: GlossaryTerm[] | undefined,
  anchorText: string,
): GlossaryTerm | undefined {
  return glossary?.find(
    (g) => g.anchor_text.toLowerCase() === anchorText.toLowerCase(),
  );
}
