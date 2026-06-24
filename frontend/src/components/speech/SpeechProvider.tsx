"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SpeechContextValue = {
  supported: boolean;
  autoRead: boolean;
  setAutoRead: (v: boolean) => void;
  speak: (text: string) => void;
  stop: () => void;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [autoRead, setAutoRead] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return;
      stop();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      window.speechSynthesis.speak(u);
    },
    [supported, stop],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("a-day-in-auto-read");
      if (saved === "1") setAutoRead(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("a-day-in-auto-read", autoRead ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [autoRead]);

  const value = useMemo(
    () => ({ supported, autoRead, setAutoRead, speak, stop }),
    [supported, autoRead, speak, stop],
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
    };
  }
  return ctx;
}
