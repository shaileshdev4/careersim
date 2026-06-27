"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function tempoToSpeechRate(tempo: number): number {
  return 0.88 + tempo * 0.28;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    idRef.current = null;
    setSpeaking(false);
    setSpeakingId(null);
  }, [supported]);

  const speak = useCallback(
    (text: string, id: string, rate = 1) => {
      if (!supported || !text.trim()) return;

      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = 1;
      utter.volume = 1;

      window.speechSynthesis.getVoices();

      idRef.current = id;
      setSpeaking(true);
      setSpeakingId(id);

      utter.onend = () => {
        if (idRef.current === id) {
          idRef.current = null;
          setSpeaking(false);
          setSpeakingId(null);
        }
      };
      utter.onerror = () => {
        if (idRef.current === id) {
          idRef.current = null;
          setSpeaking(false);
          setSpeakingId(null);
        }
      };

      window.speechSynthesis.speak(utter);
    },
    [supported],
  );

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, speakingId, supported };
}
