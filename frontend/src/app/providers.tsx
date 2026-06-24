"use client";

import { SpeechProvider } from "@/components/speech/SpeechProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SpeechProvider>{children}</SpeechProvider>;
}
