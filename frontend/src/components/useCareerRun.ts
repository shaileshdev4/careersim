"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Beat,
  Career,
  Choice,
  DayState,
  openingBeatForArcDay,
  resolveRankChoice,
  RunResult,
} from "@careersim/engine";
import {
  applyChoice,
  getBeat,
  initState,
  isDayOver,
  selectNextBeat,
} from "@careersim/engine";

export function useCareerRun(
  career: Career,
  opts?: { initialState?: DayState; arcDay?: number },
) {
  const openingId = opts?.arcDay
    ? openingBeatForArcDay(career, opts.arcDay)
    : career.openingBeatId;

  const [state, setState] = useState<DayState>(
    () => opts?.initialState ?? initState(career),
  );
  const [beat, setBeat] = useState<Beat | null>(
    () => getBeat(career, openingId) ?? null,
  );
  const [committed, setCommitted] = useState<Choice | null>(null);
  const [done, setDone] = useState(false);
  const [transcript, setTranscript] = useState<RunResult["transcript"]>([]);

  const commitChoice = useCallback(
    (choice: Choice) => {
      if (!beat || committed) return;
      const nextState = applyChoice(state, beat.id, choice, beat);
      setTranscript((t) => [
        ...t,
        { beatId: beat.id, choiceId: choice.id, choiceLabel: choice.label },
      ]);
      setState(nextState);
      setCommitted(choice);
    },
    [beat, committed, state],
  );

  const commitRank = useCallback(
    (order: string[]) => {
      if (!beat || committed) return;
      const choice = resolveRankChoice(beat, order);
      if (!choice) return;
      commitChoice(choice);
    },
    [beat, committed, commitChoice],
  );

  const advance = useCallback(() => {
    if (!beat || !committed) return;
    if (isDayOver(career, state, beat)) {
      setBeat(null);
      setCommitted(null);
      setDone(true);
      return;
    }
    const next = selectNextBeat(career, state, committed);
    setCommitted(null);
    if (!next) {
      setBeat(null);
      setDone(true);
    } else {
      setBeat(next);
    }
  }, [beat, committed, state, career]);

  const reset = useCallback(() => {
    setState(opts?.initialState ?? initState(career));
    setBeat(getBeat(career, openingId) ?? null);
    setCommitted(null);
    setTranscript([]);
    setDone(false);
  }, [career, opts?.initialState, openingId]);

  const result: RunResult = useMemo(
    () => ({
      careerId: career.id,
      finalState: state,
      transcript,
      arcDay: opts?.arcDay,
    }),
    [career.id, state, transcript, opts?.arcDay],
  );

  return {
    state,
    beat,
    committed,
    done,
    result,
    commit: commitChoice,
    commitRank,
    advance,
    reset,
  };
}
