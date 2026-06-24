"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const STORAGE_KEY = "a-day-in-onboarded-v1";

const STEPS = [
  {
    title: "Live a day, not a brochure",
    body: "Pick a career and make the calls - rounds, deadlines, hard conversations. Each scene is grounded in how the job actually feels.",
  },
  {
    title: "Three days, one arc",
    body: "Every career runs a 3-day week. What you choose on day one carries into day two. Energy drains. Patterns emerge.",
  },
  {
    title: "Mirror, not verdict",
    body: "At the end you get an honest debrief - what you leaned toward, what it cost, and a nearby career to try next. No score.",
  },
] as const;

export function useOnboarding() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY) === "1";
      setOpen(!done);
    } catch {
      setOpen(false);
    }
    setReady(true);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const reopen = () => setOpen(true);

  return { ready, open, dismiss, reopen };
}

export function Onboarding({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState(0);
  if (!open) return null;

  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      className="onboard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-title"
    >
      <div className="onboard__backdrop" onClick={onDismiss} aria-hidden />
      <div className="onboard__card scene-in">
        <Logo size="md" style={{ marginBottom: 20 }} />
        <div className="onboard__steps" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboard__dot${i === step ? " onboard__dot--on" : ""}`}
            />
          ))}
        </div>
        <h2 id="onboard-title" className="display onboard__title">
          {current.title}
        </h2>
        <p className="dim onboard__body">{current.body}</p>
        <div className="onboard__actions">
          {step > 0 && (
            <button
              type="button"
              className="choice-btn onboard__btn"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="choice-btn onboard__btn onboard__btn--primary"
            onClick={() => {
              if (last) onDismiss();
              else setStep((s) => s + 1);
            }}
          >
            {last ? "Start exploring" : "Next"}
          </button>
        </div>
        <button
          type="button"
          className="onboard__skip faint"
          onClick={onDismiss}
        >
          skip intro
        </button>
      </div>
    </div>
  );
}
