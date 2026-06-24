"use client";

import { Logo } from "./Logo";
import { ToggleSwitch } from "./ToggleSwitch";
import { useSpeechContext } from "./speech/SpeechProvider";

/** Minimal chrome during play / debrief / compare - back + toggles only. */
export function SimChrome({
  live,
  setLive,
  onHome,
}: {
  live: boolean;
  setLive: (v: boolean) => void;
  onHome: () => void;
}) {
  const { autoRead, setAutoRead, supported } = useSpeechContext();

  return (
    <div className="sim-chrome">
      <button
        type="button"
        onClick={onHome}
        className="sim-chrome__home"
        aria-label="Exit to careers"
      >
        <Logo size="sm" showBack />
      </button>
      <div className="sim-chrome__controls">
        {supported && (
          <ToggleSwitch
            label="auto read"
            value={autoRead}
            onChange={setAutoRead}
            title="When on, each new scene and consequence is read aloud automatically."
          />
        )}
        <ToggleSwitch
          label="live dramatization"
          value={live}
          onChange={setLive}
          title="When on, scenes are re-dramatized live by the model - grounded in the same facts, never changing what your choices do."
        />
      </div>
    </div>
  );
}
