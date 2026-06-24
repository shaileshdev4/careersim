"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSpeech } from "./useSpeech";

const AUTO_READ_KEY = "a-day-in-auto-read";

type SpeechContextValue = {
  autoRead: boolean;
  setAutoRead: (value: boolean) => void;
  speak: (text: string, id: string, rate?: number) => void;
  stop: () => void;
  speaking: boolean;
  speakingId: string | null;
  supported: boolean;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const speech = useSpeech();
  const [autoRead, setAutoReadState] = useState(false);

  useEffect(() => {
    try {
      setAutoReadState(localStorage.getItem(AUTO_READ_KEY) === "1");
    } catch {
      /* private browsing */
    }
  }, []);

  const setAutoRead = useCallback(
    (value: boolean) => {
      setAutoReadState(value);
      try {
        localStorage.setItem(AUTO_READ_KEY, value ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (!value) speech.stop();
    },
    [speech],
  );

  const value = useMemo(
    () => ({
      autoRead,
      setAutoRead,
      speak: speech.speak,
      stop: speech.stop,
      speaking: speech.speaking,
      speakingId: speech.speakingId,
      supported: speech.supported,
    }),
    [autoRead, setAutoRead, speech],
  );

  return (
    <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
  );
}

export function useSpeechContext(): SpeechContextValue {
  const ctx = useContext(SpeechContext);
  if (!ctx) {
    return {
      supported: false,
      autoRead: false,
      setAutoRead: () => {},
      speak: () => {},
      stop: () => {},
      speaking: false,
      speakingId: null,
    };
  }
  return ctx;
}
