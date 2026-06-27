"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Career,
  RunResult,
  ArcProgress,
  hasArc,
  newArcProgress,
  recordArcDay,
  initArcDayState,
  carryoverSummary,
} from "@careersim/engine";
import { CAREERS } from "@careersim/engine";
import { resolveStageTheme, themeFor, themeVars } from "@/components/theme";
import type { AppScreen } from "@/components/theme";
import { useCareerRun } from "@/components/useCareerRun";
import { DayClock } from "@/components/DayClock";
import { Meters } from "@/components/Meters";
import { SceneCard } from "@/components/SceneCard";
import { Debrief } from "@/components/Debrief";
import { Compare } from "@/components/Compare";
import { CareerSelect } from "@/components/CareerSelect";
import { useSpeechContext } from "@/components/speech/SpeechProvider";
import { loadArcs, saveArc, clearArc } from "@/components/useArcStorage";
import { loadRunHistory, saveRunRecord } from "@/components/useRunHistory";
import { createSavedRunRecord } from "@careersim/engine";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { SimChrome } from "@/components/SimChrome";
import { LiveBackground } from "@/components/LiveBackground";
import { Onboarding, useOnboarding } from "@/components/Onboarding";
import { SavedRunsPanel } from "@/components/SavedRuns";
import { useDramatizedBeat } from "@/components/useDramatizedBeat";
import { ArcDebrief } from "@/components/ai/ArcDebrief";
import { ScreenTransition } from "@/components/ScreenTransition";

type Screen = AppScreen;

export default function Page() {
  const [screen, setScreen] = useState<Screen>("select");
  const [career, setCareer] = useState<Career | null>(null);
  const [live, setLive] = useState(false);
  const { stop } = useSpeechContext();
  const [runs, setRuns] = useState<Record<string, RunResult>>({});
  const [arcs, setArcs] = useState<Record<string, ArcProgress>>({});
  const [playArc, setPlayArc] = useState<ArcProgress | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const [runsRefreshKey, setRunsRefreshKey] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const onboarding = useOnboarding();

  useEffect(() => {
    setRunCount(loadRunHistory().length);
  }, [runsRefreshKey, screen]);

  const stageTheme = resolveStageTheme(screen, career);
  const isShell = screen === "select" || screen === "runs";
  const simAmbient = {
    active:
      screen === "play" ||
      screen === "debrief" ||
      screen === "arcDebrief" ||
      screen === "compare",
    play: screen === "play",
    careerId: career?.id,
    energy: runs[career?.id ?? ""]?.finalState.energy,
    phase: null as string | null,
  };
  const immersiveJitter =
    !isShell && career != null && themeFor(career).jitter > 0.15;

  useEffect(() => {
    setArcs(loadArcs());
  }, []);

  useEffect(() => {
    if (screen !== "play") stop();
  }, [screen, stop]);

  const start = (c: Career, opts?: { freshArc?: boolean }) => {
    let arc: ArcProgress | null = null;
    if (hasArc(c.id)) {
      const saved = arcs[c.id];
      if (opts?.freshArc || !saved || saved.complete) {
        arc = newArcProgress(c.id);
        saveArc(arc);
        setArcs((prev) => ({ ...prev, [c.id]: arc! }));
      } else {
        arc = saved;
      }
    }
    setPlayArc(arc);
    setCareer(c);
    setPlayKey((k) => k + 1);
    setScreen("play");
  };

  const continueArc = () => {
    if (!career || !playArc) return;
    setPlayKey((k) => k + 1);
    setScreen("play");
  };

  const restartArc = () => {
    if (!career) return;
    clearArc(career.id);
    const arc = newArcProgress(career.id);
    saveArc(arc);
    setArcs((prev) => ({ ...prev, [career.id]: arc }));
    setPlayArc(arc);
    setPlayKey((k) => k + 1);
    setScreen("play");
  };

  return (
    <>
      <LiveBackground theme={stageTheme} sim={simAmbient} />
      {onboarding.ready && (
        <Onboarding open={onboarding.open} onDismiss={onboarding.dismiss} />
      )}
      <div
        className={`app-shell${isShell ? " app-shell--landing" : " app-shell--immersive"}${immersiveJitter ? " app-shell--jitter" : ""}`}
        style={isShell ? themeVars(stageTheme) : undefined}
      >
        <div
          className="app-shell__content"
          style={!isShell && career ? themeVars(themeFor(career)) : undefined}
        >
          {isShell ? (
            <AppHeader
              screen={screen}
              live={live}
              setLive={setLive}
              onHome={() => setScreen("select")}
              onRuns={() => setScreen("runs")}
              runCount={runCount}
            />
          ) : (
            <SimChrome
              live={live}
              setLive={setLive}
              onHome={() => setScreen("select")}
            />
          )}

          <ScreenTransition screenKey={screen}>
            {screen === "select" && (
              <CareerSelect
                arcs={arcs}
                onPick={start}
                onContinue={start}
                onViewRuns={() => setScreen("runs")}
                onHowItWorks={onboarding.reopen}
                runsRefreshKey={runsRefreshKey}
              />
            )}

            {screen === "runs" && (
              <SavedRunsPanel
                onBack={() => setScreen("select")}
                refreshKey={runsRefreshKey}
              />
            )}

            {screen === "play" && career && (
              <PlayScreen
                key={playKey}
                career={career}
                arc={playArc}
                live={live}
                onComplete={(r, updatedArc) => {
                  setRuns((prev) => ({ ...prev, [career.id]: r }));
                  if (updatedArc) {
                    saveArc(updatedArc);
                    setArcs((prev) => ({ ...prev, [career.id]: updatedArc }));
                    setPlayArc(updatedArc);
                  }
                  saveRunRecord(
                    createSavedRunRecord(career, r, updatedArc ?? playArc),
                  );
                  setRunsRefreshKey((k) => k + 1);
                  if (updatedArc?.complete && hasArc(career.id)) {
                    setScreen("arcDebrief");
                  } else {
                    setScreen("debrief");
                  }
                }}
              />
            )}

            {screen === "debrief" && career && runs[career.id] && (
              <Debrief
                career={career}
                result={runs[career.id]}
                theme={themeFor(career)}
                arc={playArc}
                onTryAdjacent={(id) => CAREERS[id] && start(CAREERS[id])}
                onContinueArc={continueArc}
                onReplay={() => {
                  if (!career || !playArc || !hasArc(career.id)) {
                    start(career);
                    return;
                  }
                  const trimmed = playArc.completedDays.slice(0, -1);
                  const replayed: ArcProgress = {
                    ...playArc,
                    completedDays: trimmed,
                    currentDay: trimmed.length + 1,
                    complete: false,
                  };
                  saveArc(replayed);
                  setArcs((prev) => ({ ...prev, [career.id]: replayed }));
                  setPlayArc(replayed);
                  setPlayKey((k) => k + 1);
                  setScreen("play");
                }}
                onCompare={() => setScreen("compare")}
              />
            )}

            {screen === "arcDebrief" &&
              career &&
              playArc?.complete &&
              playArc.completedDays.length > 0 && (
                <ArcDebrief
                  career={career}
                  days={playArc.completedDays}
                  theme={themeFor(career)}
                  liveEnabled={live}
                  onRestartArc={restartArc}
                  onTryAdjacent={(id) => CAREERS[id] && start(CAREERS[id])}
                  onCompare={() => setScreen("compare")}
                />
              )}

            {screen === "compare" && career && (
              <CompareGate
                runs={runs}
                current={career}
                onBack={() => setScreen("debrief")}
                onPlay={start}
              />
            )}
          </ScreenTransition>
        </div>
        {isShell && <AppFooter onHowItWorks={onboarding.reopen} />}
      </div>
    </>
  );
}

function PlayScreen({
  career,
  arc,
  live,
  onComplete,
}: {
  career: Career;
  arc: ArcProgress | null;
  live: boolean;
  onComplete: (r: RunResult, arc?: ArcProgress) => void;
}) {
  const arcDay = arc?.currentDay ?? 1;
  const prevDay = arc?.completedDays[arc.completedDays.length - 1];
  const [mentorQuestionsLeft, setMentorQuestionsLeft] = useState(3);

  useEffect(() => {
    setMentorQuestionsLeft(3);
  }, [arcDay, career.id]);

  const initialState = useMemo(
    () => initArcDayState(career, arcDay, prevDay),
    [career, arcDay, prevDay],
  );

  const run = useCareerRun(career, {
    initialState,
    arcDay: hasArc(career.id) ? arcDay : undefined,
  });
  const theme = useMemo(() => themeFor(career), [career]);
  const { content, upgrading } = useDramatizedBeat(
    career,
    run.beat,
    run.state,
    live,
  );

  const handedOff = useRef(false);
  useEffect(() => {
    if (run.done && !handedOff.current) {
      handedOff.current = true;
      let updatedArc: ArcProgress | undefined;
      if (arc && hasArc(career.id)) {
        updatedArc = recordArcDay(arc, run.result);
      }
      onComplete(run.result, updatedArc);
    }
  }, [run.done, run.result, onComplete, arc, career.id]);

  const carryover =
    arcDay > 1 && prevDay ? carryoverSummary(career, prevDay) : null;

  const recentTranscript = useMemo(() => {
    const t = run.result.transcript;
    if (t.length === 0) return "";
    return t
      .slice(-2)
      .map((e) => e.choiceLabel)
      .join("; ");
  }, [run.result.transcript]);

  const handleMentorAsked = useCallback((success: boolean) => {
    if (success) {
      setMentorQuestionsLeft((n) => Math.max(0, n - 1));
    }
  }, []);

  return (
    <div className="play-layout">
      <div className="play-layout__head">
        <div>
          <div className="eyebrow" style={{ color: theme.accent }}>
            {career.title}
            {arc && hasArc(career.id) && (
              <span className="faint" style={{ fontWeight: 400 }}>
                {" "}
                · day {arcDay} of {arc.totalDays}
              </span>
            )}
          </div>
          <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
            {theme.texture} day
          </div>
        </div>
        {run.beat && (
          <DayClock
            clock={run.state.clock}
            dayStart={career.dayStart}
            dayEnd={career.dayEndApprox}
            phase={run.beat.phase}
            theme={theme}
          />
        )}
      </div>

      {carryover && (
        <p
          className="dim scene-in"
          style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${theme.edge}`,
            background: theme.accentSoft,
            margin: 0,
          }}
        >
          {carryover}
        </p>
      )}

      {run.beat && content && (
        <SceneCard
          beat={run.beat}
          content={content}
          committed={run.committed}
          upgrading={upgrading}
          theme={theme}
          meters={career.meters}
          onCommit={run.commit}
          onCommitRank={run.commitRank}
          onAdvance={run.advance}
          layout="play"
          careerId={career.id}
          career={career}
          liveEnabled={live}
          mentorQuestionsLeft={mentorQuestionsLeft}
          onMentorAsked={handleMentorAsked}
          recentTranscript={recentTranscript}
        />
      )}

      <Meters
        defs={career.meters}
        values={run.state.meters}
        energy={run.state.energy}
        theme={theme}
        variant="play"
      />
    </div>
  );
}

function CompareGate({
  runs,
  current,
  onBack,
  onPlay,
}: {
  runs: Record<string, RunResult>;
  current: Career;
  onBack: () => void;
  onPlay: (c: Career) => void;
}) {
  const completed = Object.keys(runs);
  const others = completed.filter((id) => id !== current.id);

  if (others.length === 0) {
    const suggestions = Object.values(CAREERS)
      .filter((c) => c.id !== current.id)
      .slice(0, 3);
    return (
      <div
        className="scene-in"
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        <h2 className="display" style={{ fontSize: 22, lineHeight: 1.3 }}>
          Compare needs a second day.
        </h2>
        <p
          className="dim"
          style={{ fontSize: 15, lineHeight: 1.6, maxWidth: "46ch" }}
        >
          You&apos;ve lived a day as a {current.title.toLowerCase()}. Run one
          more, and we&apos;ll put them side by side -same you, two different
          days.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {suggestions.map((c) => (
            <button
              key={c.id}
              className="choice-btn"
              style={{ width: "auto" }}
              onClick={() => onPlay(c)}
            >
              <span style={{ color: c.mood.accent, fontWeight: 600 }}>
                Live a day as a {c.title.toLowerCase()}
              </span>
            </button>
          ))}
        </div>
        <button
          className="choice-btn"
          style={{ width: "auto", alignSelf: "flex-start" }}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    );
  }

  const otherId = others[others.length - 1];
  return (
    <Compare
      careerA={current}
      runA={runs[current.id]}
      careerB={CAREERS[otherId]}
      runB={runs[otherId]}
      onBack={onBack}
    />
  );
}
