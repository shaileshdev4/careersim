"use client";

import { Logo } from "./Logo";
import { ToggleSwitch } from "./ToggleSwitch";
import { useSpeechContext } from "./speech/SpeechProvider";
import type { AppScreen } from "./theme";

export function AppHeader({
  screen,
  live,
  setLive,
  onHome,
  onRuns,
  runCount,
}: {
  screen: AppScreen;
  live: boolean;
  setLive: (v: boolean) => void;
  onHome: () => void;
  onRuns: () => void;
  runCount: number;
}) {
  const { autoRead, setAutoRead, supported } = useSpeechContext();
  const onHomeScreen = screen === "select";

  return (
    <header
      className={`app-header${onHomeScreen ? " app-header--landing" : ""}`}
    >
      <div className="app-header__row">
        <button
          type="button"
          onClick={onHome}
          className="app-header__home"
          aria-label="Home"
        >
          <Logo size="sm" showBack={!onHomeScreen} />
        </button>
        <nav className="app-header__nav" aria-label="Main">
          <button
            type="button"
            className={`app-header__link${screen === "select" ? " app-header__link--active" : ""}`}
            onClick={onHome}
          >
            careers
          </button>
          <button
            type="button"
            className={`app-header__link${screen === "runs" ? " app-header__link--active" : ""}`}
            onClick={onRuns}
          >
            saved runs
            {runCount > 0 && (
              <span className="app-header__badge">{runCount}</span>
            )}
          </button>
        </nav>
      </div>
      {supported ? (
        <div className="app-header__controls">
          <ToggleSwitch
            label="auto read"
            value={autoRead}
            onChange={setAutoRead}
            title="When on, each new scene and consequence is read aloud automatically."
          />
          {!onHomeScreen && (
            <ToggleSwitch
              label="live"
              value={live}
              onChange={setLive}
              title="When on, scenes are re-dramatized and AI help calls the model. Requires ANTHROPIC_API_KEY."
            />
          )}
        </div>
      ) : (
        !onHomeScreen && (
          <div className="app-header__controls">
            <ToggleSwitch
              label="live"
              value={live}
              onChange={setLive}
              title="When on, scenes are re-dramatized and AI help calls the model. Requires ANTHROPIC_API_KEY."
            />
          </div>
        )
      )}
    </header>
  );
}
