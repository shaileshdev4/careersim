"use client";

import { useCallback, useEffect } from "react";
import { useSpeechContext } from "./SpeechProvider";
import { tempoToSpeechRate } from "./useSpeech";

/** Auto-read on id change + manual speak/stop for a narration block. */
export function useNarration(
  text: string,
  speechId: string,
  tempo: number,
  active: boolean,
) {
  const { autoRead, speak, stop, speakingId, supported } = useSpeechContext();
  const isSpeaking = speakingId === speechId;
  const rate = tempoToSpeechRate(tempo);

  useEffect(() => {
    if (!autoRead || !active || !text.trim() || !supported) return;
    speak(text, speechId, rate);
    return () => stop();
  }, [autoRead, active, speechId, text, speak, stop, rate, supported]);

  const toggle = useCallback(() => {
    if (!supported || !text.trim()) return;
    if (isSpeaking) stop();
    else speak(text, speechId, rate);
  }, [supported, text, isSpeaking, stop, speak, speechId, rate]);

  return { supported, isSpeaking, toggle };
}
