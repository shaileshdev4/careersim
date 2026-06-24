# A Day In — Architecture & Technical Writeup

## Repository layout

```
careersim/
├── frontend/          @careersim/frontend  — Next.js UI + /api/dramatize (Vercel)
├── backend/
│   ├── engine/      @careersim/engine    — deterministic scenario engine
│   └── api/         @careersim/api       — optional standalone API (local split-dev)
├── README.md
└── ARCHITECTURE.md
```

On Vercel, deploy `frontend/` as a single Next.js project — the dramatize route runs as a serverless function. The engine has zero UI dependencies and is tested independently.

---

## One-line pitch

Career Sim lets a teen _experience_ a realistic workday in a chosen career as a branching, decision-based simulation -surfacing what the job actually feels like before they commit a major, four years, and debt to it.

---

## The problem, precisely

Teens choose careers (and college majors and student loans) based on a job title and a vibe -never from felt experience of daily work. AI career tools have made this worse: most "AI career coaches" are chatbots with a career-advice prompt. People try them, get generic advice, and conclude AI coaching doesn't work. The failure is structural: advice describes the job; nothing makes you live a day of it.

**The specific moment that fails:** a student decides "I want to be a surgeon" after watching a TV drama, never knowing the real day is 5am rounds, three hours standing in lead, and a rigid hierarchy. They find out years later.

**The existing tools gap:**

| Tool                     | What it does       | What it misses                          |
| ------------------------ | ------------------ | --------------------------------------- |
| Personality quizzes      | Fun, shareable     | Output a label, not an experience       |
| Informational interviews | Gold standard      | Inaccessible to most teens (no network) |
| AI career chatbot        | Lists career facts | You read it; you don't feel it          |

---

## The non-obvious design insight

**Career exploration as a playable simulation, not advice.** The reframe is the differentiator: don't describe what a surgeon does -put the player at 5:02am on a Tuesday holding a list of fourteen patients, one of whom is spiking a fever and rounds start in twenty minutes. Make them decide. Then let them feel what that decision cost.

This works because the _consequence_ of a choice -the energy drain, the meter that drops, the clock that jumps -teaches more than any paragraph about surgical residency could.

---

## Architecture

The key design contract: **the engine owns the world; the model only owns the words.**

Every consequence, state delta, meter change, and tension resolution is determined by the deterministic scenario engine -pre-authored, engine-defined, immutable. The language model is permitted exactly one job: re-dramatize the authored scene prose into fresher, more specific language. It cannot touch what the player's choices do. If the model call fails, times out, or returns anything that violates the schema, the authored text fires as a seamless fallback. The demo never dies.

```
GROUNDING PACKS (the hard 20%)
  4 careers, each built from cited real day-in-the-life sources:
  -Surgeon: Henry Ford Health residency, militarydoc.com, MedResidency.
  -Software Engineer: The Coding Diaries, CareerVillage, ProResumes.
  -Elementary Teacher: Today's Parent, EdWeek, Edutopia, Frontiers in Psychology.
  -IB Analyst: Mergers & Inquisitions, ibankingadvice.com, Management Consulted.
  Each pack: 3 sourced tensions, 3 career-specific state meters,
  5+ beats with eligibility guards, per-career mood/palette/tempo.
         │
         ▼
SCENARIO ENGINE (deterministic -owns the world)
  ┌─────────────────────────────────────────────────────┐
  │  DayState: clock, energy, 3 career meters, leanLog  │
  │  Beat skeleton: phase-ordered, eligibility-gated    │
  │  Beat selection: clockAnchor-ordered, state-aware   │
  │     → same career, different choices = different day│
  │  StateDelta: engine-defined per choice -immutable  │
  │  applyChoice() → new DayState (pure, immutable)     │
  │  selectNextBeat() → branches on accumulated state   │
  └─────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
GENERATION CONTRACT             DETERMINISTIC FALLBACK
  ┌──────────────────┐           (always fires if model
  │ buildRequest():  │            call fails, times out,
  │  -grounding     │            or violates schema)
  │  -authored text │
  │  -fixed choiceIds (model    ┌─────────────────────┐
  │    cannot add/drop/reorder)  │ authored beat text  │
  │  -state tone hint (no math) │ verbatim, no network│
  │  -6s timeout w/ abort       └─────────────────────┘
  │ validateResponse():
  │  -exact id match (contract)
  │  -length guards
  │  -type guards
  │  → reject → fallback
  └──────────────────┘
         │
         ▼
CLIENT HOOK (useDramatizedBeat)
  Renders authored text IMMEDIATELY (zero latency).
  Fetches model upgrade in background.
  Swaps in model prose only if it validates server-side.
  Player never waits. Dead API = authored text stays.
         │
         ▼
LIVING UI -the UX showpiece
  Per-career cinematic surface: gradient + grain + accent glow.
  Tempo-as-character: clock, meters, and transitions animate
    at each career's tempo (surgeon brisk, engineer languid,
    teacher jittery, analyst grinding).
  Day-clock arc advances in real time.
  Meters pop-animate on state change -consequence felt, not just read.
  Commit/advance two-step: meters react AS the consequence shows.
         │
         ▼
REFLECTION AGENT (deterministic)
  Reads the full leanLog from the run.
  Computes per-tension lean score (−1..+1) from player choices.
  Derives: pattern (the strongest behavioral read), fit signals,
    adjacent careers from a hand-authored graph keyed on lean direction.
  Never invents -reads what the player actually did.
         │
         ▼
COMPARE MODE (the peak)
  Two completed days, side by side, each in its own career palette.
  compareRuns() surfaces: rhythm contrast, depletion contrast,
    decision-texture contrast.
  "Surgeon runs tense; Software Engineer runs quiet.
   The rhythm of the two days is not the same kind of hard."
```

---

## The hard 20% -what's genuinely non-trivial

Three things a single-prompt GPT wrapper structurally cannot do:

**1. Grounding that holds up to scrutiny.**
The authenticity problem with AI career simulations is that models default to the Hollywood version of every job. The solution is hand-authored grounding packs built from real day-in-the-life sources (cited in-code, linked in the repo). Each career's beats are constructed around sourced real specifics -the surgeon's 5am rounds and list-running aren't invented, they're drawn from Henry Ford Health's residency documentation and a surgical resident's own account. The model re-dramatizes this material; it never invents the job.

**2. State that compounds.**
The scenario engine is a real stateful machine. The fatigue beat only fires for the surgeon when you've drained your energy below a threshold -meaning a player who pushes hard unlocks a decision that a pacing player never sees. This is mechanically verified: two different play-policies produce different days (tested). That's what makes it a simulation and not a multiple-choice quiz.

**3. The generation contract.**
Making live model generation genuinely safe to demo -not just safe in theory -required building a validator that rejects any model output that would alter the engine's world (added choices, dropped choices, reordered choices, non-JSON, runaway length), a hard timeout with abort, and a seamless deterministic fallback. The validator is the safety layer; the authored text is the guarantee. This is tested with injected transports: valid output passes through, every failure mode (garbage, throw, timeout, disabled) falls back silently.

---

## What's verified (test suite)

**Engine harness (12 tests):**

-All four career packs structurally valid and source-grounded
-Full days complete and end on real finales across every career and play policy
-State invariants never break (energy/meters stay 0–100; clock advances)
-No beat repeats within a run
-Different policies yield genuinely different days (branching is real)
-State-gated beats gate correctly: draining the surgeon fires the fatigue beat; pacing avoids it
-Reflection lean scores match the actual choice log (sign-correct)
-Compare synthesis surfaces a real multi-axis contrast
-Clock spans believable real-day windows (surgeon 5am–7pm, analyst 9am–11:30pm)

**Generation contract harness (15 tests):**

-Valid model output passes through and is marked `source: model`
-Rejects: added choice id, dropped choice id, non-JSON, short/long scene, non-string label
-Strips markdown fences before parsing
-Fallback preserves exact engine structure
-Orchestrator: falls back on garbage response, throw, timeout (fast abort), disabled, no-key
-Prompt never leaks engine math (deltas/meter arithmetic) to the model

---

## Tech stack

-**Framework:** Next.js 14 (App Router) + TypeScript + Tailwind -**Motion:** Framer Motion (tempo-driven, `prefers-reduced-motion` respected) -**Font:** Space Grotesk (self-hosted via fontsource -no Google Fonts network call at build) -**AI:** Claude (claude-sonnet-4-6) via Anthropic API, server-side only, key never exposed to client -**Engine:** Pure TypeScript, zero runtime dependencies, 100% testable offline -**Build:** `npm run build` → clean production output, ESLint clean, TypeScript strict mode

---

## Grounding sources (cited in-code)

**Surgeon:**

-Henry Ford Health Orthopaedic Residency -Day in the Life (5am rounds, list-running, OR roles)
-militarydoc.com surgical resident account (Grey's Anatomy gap, 4-5h sleep, cases running long)
-MedResidency -Expectations vs Reality ("structured and repetitive, no drama")
-Residency Advisor orthopaedic surgery resident (lead fatigue, hierarchy, call-room naps)

**Software Engineer:**

-The Coding Diaries, Medium (coding is ~20% of the day; Jira, PRs, the YouTube glamour gap)
-CareerVillage -day-to-day SWE (standup, blockers, code review, requirements sync)
-Quora -"code is invisible" (invisible progress, the 90%/10% dictum, "moving protocol buffers")
-ProResumes -unfiltered SWE day (on-call, async, the gap between vlogs and real work)

**Elementary Teacher:**

-Today's Parent -day in the life (early arrival, door-side parent questions, 20-min lunch)
-EdWeek -"The Most Exhausting Part Isn't the Students" (emotional labor, late-night planning)
-Edutopia -emotional labor of teaching (calm/consistent performance regardless of own state)
-Frontiers in Psychology (2014 study) -teachers suppress/fake emotion in ~⅓ of lessons

**Investment Banking Analyst:**

-Mergers & Inquisitions -IB hours (60–80h/week, 3am changes, waiting on seniors)
-ibankingadvice.com -analyst day (submit at 10:30pm → "I'll look tomorrow"; intern waiting; taxi midnight)
-Management Consulted -IB vs consulting (client error "looks bad to buyers"; constant revisions)
-Growth Equity Interview Guide -IB hours (80 office hours ≈ 60 real-work hours; availability theater)

---

## What it is not

-Not a chatbot that describes careers. (You play a day; no conversational interface.)
-Not a personality quiz. (The debrief reads your actual choices back, not a type label.)
-Not grounded in stereotypes. (Every beat is sourced. The model re-dramatizes grounded material; it never invents the job.)
-Not AI-dependent for the demo. (The engine runs a full coherent day without any API call. Live generation is an enhancement.)

---

## The peak demo moment

Play a day as a surgeon. Play a day as a software engineer. Then hit Compare.

_"Surgeon runs tense; Software Engineer runs quiet. The rhythm of the two days is not the same kind of hard. One day left you far more depleted: Surgeon ended at 31/100 energy. Where a day spends you matters as much as what it pays. In Surgeon the day kept asking you about decisiveness vs. caution; in Software Engineer it was quiet work vs. visible work. Different jobs press on different parts of you."_

Same player. Two days. One clear-eyed picture of what's different. That's what a job title has never given anyone.
