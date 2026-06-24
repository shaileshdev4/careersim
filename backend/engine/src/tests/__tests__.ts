/* eslint-disable no-console */
import { Beat, DayState } from "../types";
import { CAREER_LIST, CAREERS } from "../data";
import {
  initState,
  getBeat,
  applyChoice,
  selectNextBeat,
  isDayOver,
  runDay,
  formatClock,
  resolveRankChoice,
  formatDeltaPreview,
  isRankBeat,
} from "../scenario";
import { reflect, compareRuns, reflectArc } from "../reflect";
import {
  initArcDayState,
  newArcProgress,
  recordArcDay,
  buildEnergyTimeline,
  whatBroke,
} from "../arc";
import { formatDebriefReport } from "../export";

type Test = { name: string; run: () => void };
let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function test(name: string, fn: () => void): Test {
  return { name, run: fn };
}

const inRange = (n: number) => n >= 0 && n <= 100;

// ---------------------------------------------------------------------------
// Policies for deterministic full-day runs.
// ---------------------------------------------------------------------------
const alwaysFirst = () => 0;
const alwaysLast = (b: Beat) => b.choices.length - 1;
const alternating = (() => {
  let i = 0;
  return () => i++ % 2;
})();

const tests: Test[] = [
  // 1. Every career pack is structurally valid.
  test("All career packs are structurally valid", () => {
    for (const c of CAREER_LIST) {
      check(c.beats.length >= 4, `${c.id}: needs >=4 beats`);
      check(!!getBeat(c, c.openingBeatId), `${c.id}: opening beat missing`);
      check(c.tensions.length >= 2, `${c.id}: needs >=2 tensions`);
      check(c.meters.length === 3, `${c.id}: needs exactly 3 meters`);
      check(
        c.beats.some((b) => b.isFinale),
        `${c.id}: needs at least one finale`,
      );
      const tensionIds = new Set(c.tensions.map((t) => t.id));
      const meterIds = new Set(c.meters.map((m) => m.id));
      for (const b of c.beats) {
        check(
          b.choices.length >= 2 && b.choices.length <= 4,
          `${c.id}/${b.id}: 2-4 choices required`,
        );
        const ids = new Set(b.choices.map((ch) => ch.id));
        check(
          ids.size === b.choices.length,
          `${c.id}/${b.id}: duplicate choice ids`,
        );
        for (const ch of b.choices) {
          check(
            typeof ch.delta.advanceMinutes === "number",
            `${c.id}/${ch.id}: advanceMinutes required`,
          );
          if (ch.delta.tensionId)
            check(
              tensionIds.has(ch.delta.tensionId),
              `${c.id}/${ch.id}: unknown tensionId`,
            );
          if (ch.delta.tensionId)
            check(
              ch.delta.pole === "A" || ch.delta.pole === "B",
              `${c.id}/${ch.id}: pole required with tension`,
            );
          if (ch.delta.meters)
            for (const k of Object.keys(ch.delta.meters))
              check(meterIds.has(k), `${c.id}/${ch.id}: unknown meter ${k}`);
          if (ch.nextBeatId)
            check(
              !!getBeat(c, ch.nextBeatId),
              `${c.id}/${ch.id}: nextBeatId targets missing beat`,
            );
          check(
            ch.consequence.length > 10,
            `${c.id}/${ch.id}: consequence text too thin`,
          );
        }
        if (b.rank) {
          check(
            b.rank.items.length >= 2,
            `${c.id}/${b.id}: rank needs >=2 items`,
          );
          for (const item of b.rank.items) {
            const mapped = b.rank.topItemToChoiceId[item.id];
            check(
              !!mapped && ids.has(mapped),
              `${c.id}/${b.id}: rank item ${item.id} maps to missing choice`,
            );
          }
        }
        if (b.pressure) {
          check(
            ids.has(b.pressure.defaultChoiceId),
            `${c.id}/${b.id}: pressure defaultChoiceId invalid`,
          );
          check(
            b.pressure.deadlineSeconds > 0,
            `${c.id}/${b.id}: pressure deadline must be positive`,
          );
        }
        if (b.artifacts) {
          for (const a of b.artifacts) {
            check(
              a.body.length > 10,
              `${c.id}/${b.id}/${a.id}: artifact too thin`,
            );
          }
        }
      }
    }
  }),

  // 2. Every career has cited sources (the honesty layer).
  test("Every career is grounded in cited sources", () => {
    for (const c of CAREER_LIST) {
      check(
        c.sources.length >= 3,
        `${c.id}: needs >=3 sources, has ${c.sources.length}`,
      );
      for (const s of c.sources) {
        check(
          /^https?:\/\//.test(s.url),
          `${c.id}: source url malformed: ${s.url}`,
        );
        check(
          s.grounds.length > 10,
          `${c.id}: source must say what it grounds`,
        );
      }
    }
  }),

  // 3. A full day completes and ends on a finale, for every career & policy.
  test("Full days complete and terminate on a finale (all careers, all policies)", () => {
    const policies = [alwaysFirst, alwaysLast, alternating];
    for (const c of CAREER_LIST) {
      for (const p of policies) {
        const run = runDay(c, p);
        check(
          run.transcript.length >= 4,
          `${c.id}: day too short (${run.transcript.length} beats)`,
        );
        const lastBeatId = run.transcript[run.transcript.length - 1].beatId;
        const lastBeat = getBeat(c, lastBeatId)!;
        // The day must end either on a finale or because nothing else was selectable.
        const endedClean =
          lastBeat.isFinale || isDayOver(c, run.finalState, lastBeat);
        check(
          endedClean,
          `${c.id}: day didn't end cleanly (last beat ${lastBeatId})`,
        );
      }
    }
  }),

  // 4. State invariants hold throughout (energy & meters stay 0-100; clock advances).
  test("State invariants never break across a full day", () => {
    for (const c of CAREER_LIST) {
      let state = initState(c);
      let beat = getBeat(c, c.openingBeatId)!;
      let prevClock = -1;
      let guard = 0;
      while (beat && guard < 50) {
        guard++;
        check(
          inRange(state.energy),
          `${c.id}/${beat.id}: energy out of range (${state.energy})`,
        );
        for (const [k, v] of Object.entries(state.meters))
          check(
            inRange(v),
            `${c.id}/${beat.id}: meter ${k} out of range (${v})`,
          );
        check(
          state.clock >= prevClock,
          `${c.id}/${beat.id}: clock went backwards`,
        );
        prevClock = state.clock;
        const choice = beat.choices[0];
        state = applyChoice(state, beat.id, choice, beat);
        if (isDayOver(c, state, beat)) break;
        beat = selectNextBeat(c, state, choice)!;
      }
      check(guard < 50, `${c.id}: possible infinite loop`);
    }
  }),

  // 5. No beat is ever visited twice in a single run.
  test("No beat repeats within a run", () => {
    for (const c of CAREER_LIST) {
      const run = runDay(c, alternating);
      const seen = new Set<string>();
      for (const t of run.transcript) {
        check(!seen.has(t.beatId), `${c.id}: beat ${t.beatId} repeated`);
        seen.add(t.beatId);
      }
    }
  }),

  // 6. Branching actually happens: different policies produce different paths.
  test("Choices compound -different policies yield different days", () => {
    for (const c of CAREER_LIST) {
      const a = runDay(c, alwaysFirst)
        .transcript.map((t) => t.choiceId)
        .join(">");
      const b = runDay(c, alwaysLast)
        .transcript.map((t) => t.choiceId)
        .join(">");
      check(
        a !== b,
        `${c.id}: policies produced identical transcripts (no real branching)`,
      );
    }
  }),

  // 7. State-gated beats only fire when their predicate is satisfiable.
  test("Eligibility predicates gate beats correctly (surgeon fatigue beat)", () => {
    const c = CAREERS["surgeon"];
    const fatigue = getBeat(c, "s_fatigue")!;
    // With full energy, the fatigue beat must be ineligible.
    const fresh: DayState = { ...initState(c), energy: 100 };
    check(
      !!fatigue.eligibleWhen && !fatigue.eligibleWhen(fresh),
      "fatigue beat should be ineligible at full energy",
    );
    // With low energy + prerequisite visited, eligible.
    const tired: DayState = {
      ...initState(c),
      energy: 40,
      visited: ["s_rounds", "s_or_scrub"],
    };
    check(
      !!fatigue.eligibleWhen && fatigue.eligibleWhen(tired),
      "fatigue beat should be eligible when drained",
    );
  }),

  // 8. Reflection reads the lean log into a coherent debrief.
  test("Reflection agent produces a coherent debrief", () => {
    for (const c of CAREER_LIST) {
      const run = runDay(c, alwaysFirst);
      const r = reflect(c, run);
      check(r.pattern.length > 20, `${c.id}: empty/thin pattern`);
      check(r.fitSignals.length >= 1, `${c.id}: no fit signals`);
      check(r.adjacent.length >= 1, `${c.id}: no adjacent careers`);
      for (const adj of r.adjacent) {
        check(
          !!CAREERS[adj.careerId],
          `${c.id}: adjacent points to unknown career ${adj.careerId}`,
        );
        check(adj.careerId !== c.id, `${c.id}: adjacent points to itself`);
      }
      check(r.caveat.length > 20, `${c.id}: missing honesty caveat`);
    }
  }),

  // 9. Reflection lean direction matches the policy that produced it.
  test("Reflection lean direction reflects the actual choices", () => {
    const c = CAREERS["engineer"];
    // alwaysFirst tends to pick the first (often poleA-ish) option; just assert
    // that a tension that was exercised has a non-zero, sign-consistent score.
    const run = runDay(c, alwaysFirst);
    const r = reflect(c, run);
    const exercised = r.leans.filter((l) => l.count > 0);
    check(
      exercised.length >= 1,
      "engineer run should exercise at least one tension",
    );
    for (const l of exercised) {
      const fromLog = run.finalState.leanLog.filter(
        (e) => e.tensionId === l.tension.id,
      );
      const sum = fromLog.reduce(
        (acc, e) => acc + (e.pole === "A" ? 1 : -1),
        0,
      );
      const expected = sum / fromLog.length;
      check(
        Math.abs(expected - l.score) < 1e-9,
        `${l.tension.id}: score mismatch`,
      );
    }
  }),

  // 10. Clock formatting and day-length sanity.
  test("Clock advances within a believable day window", () => {
    for (const c of CAREER_LIST) {
      const run = runDay(c, alwaysFirst);
      const start = c.dayStart;
      const end = run.finalState.clock;
      check(end > start, `${c.id}: day ended before it began`);
      check(
        end - start <= 20 * 60,
        `${c.id}: day spanned >20h (${formatClock(start)}–${formatClock(end)})`,
      );
      check(end - start >= 60, `${c.id}: day suspiciously short`);
    }
  }),

  // 11. State-gated beats are REACHABLE under the policy that should trigger them.
  test("Draining the surgeon unlocks the fatigue branch (compounding is real)", () => {
    const c = CAREERS["surgeon"];
    const drain = (b: Beat) => {
      let worst = 0,
        wi = 0;
      b.choices.forEach((ch, i) => {
        const cost = -(ch.delta.energy ?? 0);
        if (cost > worst) {
          worst = cost;
          wi = i;
        }
      });
      return wi;
    };
    const run = runDay(c, drain);
    check(
      run.transcript.some((t) => t.beatId === "s_fatigue"),
      "fatigue beat should fire on a draining path",
    );
    check(
      run.finalState.energy < 55,
      `draining path should end depleted, got ${run.finalState.energy}`,
    );
  }),

  // 12. Rank interaction maps top priority to the correct authored choice.
  test("Rank beat resolves top priority to the correct choice", () => {
    const beat = getBeat(CAREERS["surgeon"], "s_rounds")!;
    check(isRankBeat(beat), "s_rounds should be a rank beat");
    const fast = resolveRankChoice(beat, ["febrile", "stable", "consult"]);
    check(fast?.id === "s_rounds_fast", "febrile first -> fast triage");
    const thorough = resolveRankChoice(beat, ["stable", "febrile", "consult"]);
    check(thorough?.id === "s_rounds_thorough", "stable first -> thorough");
    const ask = resolveRankChoice(beat, ["consult", "febrile", "stable"]);
    check(ask?.id === "s_rounds_ask", "consult first -> escalate");
    const preview = formatDeltaPreview(fast!.delta, CAREERS["surgeon"].meters);
    check(preview.length > 0, "delta preview should list changes");
  }),

  // 12b. All careers with rank beats resolve correctly.
  test("Rank beats resolve for engineer, teacher, and analyst", () => {
    const cases: [string, string, string[], string][] = [
      ["engineer", "e_standup", ["honest", "spin", "flow"], "e_su_honest"],
      ["engineer", "e_standup", ["flow", "honest", "spin"], "e_su_skip"],
      ["teacher", "t_arrival", ["prep", "breathe"], "t_arr_prep"],
      ["teacher", "t_arrival", ["breathe", "prep"], "t_arr_breathe"],
      ["analyst", "a_open", ["meticulous", "fast"], "a_open_grind"],
      ["analyst", "a_open", ["fast", "meticulous"], "a_open_fast"],
    ];
    for (const [careerId, beatId, order, expectedChoiceId] of cases) {
      const beat = getBeat(CAREERS[careerId], beatId)!;
      check(isRankBeat(beat), `${beatId} should be a rank beat`);
      const choice = resolveRankChoice(beat, order);
      check(
        choice?.id === expectedChoiceId,
        `${careerId}/${beatId} top ${order[0]} -> ${expectedChoiceId}`,
      );
    }
  }),

  // 12c. Reflection cites beat-by-beat moments from the transcript.
  test("Reflection includes beat-by-beat moments", () => {
    const c = CAREERS["teacher"];
    const run = runDay(c, alwaysFirst);
    const r = reflect(c, run);
    check(
      r.moments.length === run.transcript.length,
      "moments should mirror transcript length",
    );
    check(
      r.moments[0].includes("- you chose:"),
      "moments should cite choices with clock",
    );
  }),

  // 14. Multi-day arc carryover and opening beats.
  test("Arc carryover preserves lean log and opens correct day beat", () => {
    const c = CAREERS["surgeon"];
    const day1 = runDay(c, alwaysFirst, { arcDay: 1 });
    check(day1.finalState.leanLog.length >= 1, "day 1 should log leans");
    const day2State = initArcDayState(c, 2, day1);
    check(day2State.arcDay === 2, "day 2 state should have arcDay 2");
    check(
      day2State.leanLog.length === day1.finalState.leanLog.length,
      "lean log should carry over",
    );
    check(day2State.visited.length === 0, "visited should reset each day");
    check(
      day2State.energy > day1.finalState.energy,
      "overnight should recover some energy",
    );
    const day2 = runDay(c, alwaysFirst, {
      arcDay: 2,
      startState: day2State,
    });
    check(
      day2.transcript[0]?.beatId === "s_rounds_d2",
      "day 2 should open on arc beat",
    );
    const timeline = buildEnergyTimeline(c, day2, day2State.energy);
    check(timeline.length > 1, "energy timeline should have points");
    const broke = whatBroke(c, timeline);
    check(Array.isArray(broke), "whatBroke should return strings");
  }),

  // 15. Full 3-day surgeon arc completes.
  test("Three-day surgeon arc runs to completion", () => {
    const c = CAREERS["surgeon"];
    let progress = newArcProgress("surgeon");
    let prev: RunResult | undefined;
    for (let d = 1; d <= 3; d++) {
      const state = initArcDayState(c, d, prev);
      const run = runDay(c, alwaysFirst, { arcDay: d, startState: state });
      progress = recordArcDay(progress, run);
      prev = run;
    }
    check(progress.complete, "arc should be complete after 3 days");
    check(progress.completedDays.length === 3, "should have 3 day results");
    const arcRefl = reflectArc(c, progress.completedDays);
    check(arcRefl.daysPlayed === 3, "arc reflection should cover 3 days");
    check(arcRefl.moments.length > 3, "arc moments should span all days");
  }),

  // 15b. Teacher and analyst arcs open correct day beats.
  test("Teacher and analyst arcs open correct day 2 beats", () => {
    for (const [id, beatId] of [
      ["teacher", "t_arrival_d2"],
      ["analyst", "a_open_d2"],
    ] as const) {
      const c = CAREERS[id];
      const day1 = runDay(c, alwaysFirst, { arcDay: 1 });
      const day2 = runDay(c, alwaysFirst, {
        arcDay: 2,
        startState: initArcDayState(c, 2, day1),
      });
      check(
        day2.transcript[0]?.beatId === beatId,
        `${id} day 2 should open on ${beatId}`,
      );
    }
  }),

  test("Debrief export formats a readable text report", () => {
    const c = CAREERS["teacher"];
    const run = runDay(c, alwaysFirst, { arcDay: 1 });
    const report = formatDebriefReport(c, run);
    check(report.includes("A DAY IN"), "report should have header");
    check(report.includes(c.title), "report should name career");
    check(report.includes("PATTERN"), "report should include pattern section");
    check(report.length > 200, "report should be substantive");
  }),

  test("Compare mode surfaces a genuine contrast (surgeon vs engineer)", () => {
    const s = CAREERS["surgeon"];
    const e = CAREERS["engineer"];
    const drain = (b: Beat) => {
      let worst = 0,
        wi = 0;
      b.choices.forEach((ch, i) => {
        const cost = -(ch.delta.energy ?? 0);
        if (cost > worst) {
          worst = cost;
          wi = i;
        }
      });
      return wi;
    };
    const cmp = compareRuns(
      s,
      runDay(s, drain),
      e,
      runDay(e, () => 0),
    );
    check(cmp.headline.includes("vs."), "headline frames a contrast");
    check(
      cmp.contrasts.length >= 2,
      `expected multiple contrast axes, got ${cmp.contrasts.length}`,
    );
    check(cmp.a.texture !== cmp.b.texture, "the two textures should differ");
    check(cmp.playStyleA.length > 5, "play style A should be descriptive");
    check(cmp.playStyleB.length > 5, "play style B should be descriptive");
  }),
];

console.log("\n=== CAREER SIM -ENGINE TEST HARNESS ===\n");
for (const t of tests) {
  try {
    t.run();
    passed++;
    console.log(`  ✓ ${t.name}`);
  } catch (e) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`${t.name} → ${msg}`);
    console.log(`  ✗ ${t.name}`);
    console.log(`      ${msg}`);
  }
}

console.log(`\n---${passed} passed, ${failed} failed ---`);

// Sample a real day for eyeballing.
if (failed === 0) {
  const c = CAREERS["surgeon"];
  const run = runDay(c, alwaysFirst);
  console.log(`\nSample run -${c.title} (always-first policy):`);
  for (const t of run.transcript) {
    const b = getBeat(c, t.beatId)!;
    console.log(`  [${b.phase}] ${t.beatId}: "${t.choiceLabel.slice(0, 60)}…"`);
  }
  console.log(
    `  final clock ${formatClock(run.finalState.clock)}, energy ${run.finalState.energy}`,
  );
  const r = reflect(c, run);
  console.log(`  pattern: ${r.pattern}`);
  console.log(`  adjacent: ${r.adjacent.map((a) => a.careerId).join(", ")}`);
}

if (failed > 0) process.exit(1);
