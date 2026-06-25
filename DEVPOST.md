# A Day In - Devpost Submission

---

## Project name

**A Day In**

---

## Elevator pitch (200 chars max)

> Don't read about a career. Live a day of it. Eight grounded 3-day arcs - surgeon, teacher, analyst, more - where you make the calls and feel what the arc actually costs you.

*(193 characters)*

**Alternates if you want a different angle:**

- "Career exploration as a playable simulation, not advice. Eight careers, three-day arcs, real day-in-the-life decisions - and a debrief that reads your choices back." *(189)*
- "Pick a career and live a Tuesday in it. Make the calls. Feel the cost. Compare two days side by side. Eight jobs, every beat grounded in real day-in-the-life sources." *(183)*

---

## Project story (About the project)

### Inspiration

I'm seventeen and I'm supposed to know what I want to be. So is everyone around me. We're picking majors and applying to schools and signing up for four years of debt based on a job *title* and a vibe - usually a vibe we got from a TV show.

I kept watching friends do this. One picked pre-med because of *Grey's Anatomy*. Another picked finance because they liked the word "analyst." None of us actually knew what those people *do* on a Tuesday. We had read about it. We had never lived a minute of it.

The AI tools that are supposed to help here mostly make it worse. You ask ChatGPT what a surgeon's day is like and you get a paragraph that could be a Wikipedia summary. You read the paragraph. You feel nothing. You still don't know.

I wanted to build the thing that would have helped me. Not advice. Not a quiz that gives you a personality label. Something where you actually sit at 5:02 AM in a hospital with fourteen patients on your list and one of them is spiking a fever and rounds start in twenty minutes and you have to *decide*.

### What it does

A Day In is a grounded, branching career simulator built for **Youth Code x AI - Track 04: Career/Life**. You pick a career - surgeon, software engineer, elementary teacher, investment banking analyst, ER nurse, journalist, social worker, UX designer - and you live a three-day arc in their life.

Every scene is built from real day-in-the-life material. Every choice carries real consequences: the clock advances, your energy drains, the career's three specific meters (Standing, The List, Composure for a surgeon; Clarity, Buy-in, Craft for a UX designer) move with you. The decisions you made on Monday change what Tuesday even offers you.

There's no score. There's a mirror. At the end of each day, the app reads your choices back to you - not as a personality type, but as a pattern: *"You consistently leaned toward voice over deference. When it mattered, you chose to speak."* Then you can run a second career and put both days side by side: same player, two very different Tuesdays. Same hours. Different kind of hard.

### How I built it

The architecture has one rule and the whole thing hangs on it: **the engine owns the world, the model only owns the words.**

The deterministic scenario engine is the source of truth. Every consequence, every meter change, every branch is pre-defined, immutable, fully tested offline. The language model (Claude Sonnet 4.6) is allowed exactly one job: re-dramatize the authored scene prose into fresher, more specific language, grounded in the same cited sources the engine was built from. It cannot touch what choices do.

This isn't paranoia, it's the whole point. AI career tools fail because they default to the Hollywood version of every job. The structural fix is to separate the grounding work (sourced, human-written, immutable) from the dramatization work (model). When the model returns anything that would violate the contract - added choices, dropped choices, runaway length, malformed JSON - a validator rejects it and the authored text fires as a seamless fallback. The sim runs a complete day without a single network call. The demo cannot break.

I shipped:

- **Eight career packs**, each with 6–7 scenes per day across a 3-day arc, three sourced tensions, three career-specific meters, an authored mood (palette, tempo, ambient image), and 3–4 cited day-in-the-life sources in code.
- **A real state machine** - energy, meters, clock, lean log, visited beats - where state genuinely compounds. The surgeon's fatigue beat only fires if you've drained yourself; pacing players never see it. Arc carryover means Tuesday remembers what Monday cost you.
- **Rich decision mechanics** - ranked triage beats where you reorder a list and the top item sets your approach, clickable inspect artifacts (overnight handoff, patient list, colleague email) you read before deciding, soft pressure timers that auto-default if you stall, delta previews on hover so you see the cost before committing.
- **A cinematic UI** - per-career palette/grain/glow, day-clock that advances as the spine of the screen, meters that react the moment you commit, tempo-as-character (surgeon brisk, engineer languid, teacher frantic), photo-backed ambient backgrounds, auto-read narration, and a Compare screen that puts two completed days side by side in their own living palettes.
- **A deterministic reflection agent** that reads your actual choice log into a debrief - pattern, tension leans, fit signals, adjacent careers to try next.

**Stack:** Next.js 14, TypeScript, Tailwind, Framer Motion. Engine is a pure-TS monorepo package with 34 passing tests (18 scenario/arc, 15 generation-contract). Claude Sonnet 4.6 server-side only - key never reaches the client. Self-hosted Space Grotesk so the build doesn't depend on Google Fonts at deploy time. Deployed on Vercel.

### Challenges I ran into

**The authenticity problem.** Models default to the TV version of every job. The fix isn't a better prompt, it's structural: ground the engine in cited real sources and forbid the model from touching the engine's world. Writing eight grounded career packs is real work - I read more than thirty primary day-in-the-life accounts (Henry Ford Health's surgical residency docs, *Today's Parent*'s elementary-teacher day, Mergers & Inquisitions on IB hours, *The Coding Diaries* on software engineering, and on). That research is the hard 20%, and it is not automatable.

**Making "live AI in a demo" actually safe.** The first version of the dramatization path had everything you'd expect (try/catch, a timeout). It still wasn't safe enough. A model that returns a valid-looking response with one choice ID renamed silently breaks the engine. So I wrote a real validator that asserts exact ID match, length bounds, type guards, JSON shape, and a hard 6-second abort. Anything that fails falls back to authored text without the player ever knowing. I tested it by injecting transports that return garbage, throw, time out, and return mismatched IDs - all fall back silently.

**The day kept ending too early.** Early on, the engine would pick a finale beat in the middle of the day because phase ordering and priority were fighting each other. I rebuilt selection to order primarily by `clockAnchor` - the real wall-clock minute each scene begins at - so narrative time always flows forward and finales can't fire while non-finale beats are still eligible.

**The cause-effect gap.** The first build applied the choice's delta only after you hit Continue, which meant you'd read "you're already moving, you haven't eaten" while Energy still said 100. The fix was a two-step commit/advance flow: when you commit, the meters react *immediately* and the consequence text shows up. You feel the choice land before you move on.

### Accomplishments I'm proud of

The Compare screen. After you've finished one day as two different careers in the same session, the app puts them side by side, each in its own palette, and names what was different - the rhythm, the depletion, the kind of decision each day forced. *"Surgeon runs tense; Software Engineer runs quiet. The rhythm of the two days is not the same kind of hard."* That sentence comes from the engine's own state, not from a model describing it. The moment two panels load in their different palettes is the moment the whole idea lands.

Also: eight careers. The spec asked for three to four deep. I did eight because the contrasts were too good to leave out. Surgeon vs. UX Designer is a different conversation than Surgeon vs. Engineer.

### What I learned

The most useful idea I had on this project was naming the contract first and never bending it: the engine owns the world; the model owns the words. Every later question - demo safety, grounding integrity, the authenticity problem, how to make the AI a feature instead of a liability - got cleaner once that line was drawn. The model is the right tool for prose. It is the wrong tool for consequences. Most "AI apps" don't get this distinction right, and you can feel it.

The other thing I learned is that cinematic small details - a clock that advances as an arc, meters that pop the instant you commit, tempo that differs per career, contrasting palettes when Compare loads - do more work than any animation library could. You don't need motion *everywhere*. You need motion that means something.

### What's next for A Day In

- **More careers.** ER physician, public defender, startup founder, chef, athletic trainer, museum curator. The bottleneck is grounding research, which is the right bottleneck.
- **Arc-end debrief.** The engine already has `reflectArc()` and a "what broke" surfacer. They need a screen of their own at the end of day 3.
- **Energy-and-meter timeline.** Show the player how their arc actually went, hour by hour, scene by scene.
- **Compare from saved runs.** Today you can only compare runs from the same session. Lifting that to a real history is a small change with a big effect.
- **Counselor/classroom mode.** Share a sim with someone. Have them play it. Look at their patterns together. This is where it stops being a hackathon project and starts being a tool.

---

## Built with

```
typescript, next.js, react, tailwind-css, framer-motion, anthropic-claude, claude-sonnet-4.6, node.js, vercel, web-speech-api, space-grotesk, html5, css3, javascript, markdown, eslint, monorepo, npm-workspaces
```

*(Devpost wants this as a comma-separated array - paste exactly that line.)*

---

## Thumbnail prompts (3:2, for AI image generator)

These are written for a model that can render text and complex composition cleanly. **For Devpost upload:** use the hero poster (Prompt 2) as the cover thumbnail; add the Compare mockup (Prompt 1) as a gallery image.

### Prompt 1 - The Compare moment (gallery image #2)

> A dark, cinematic split-screen UI mockup, 3:2 aspect ratio. Left half: a deep teal-and-near-black surface with subtle film grain and a soft accent glow in the top-right corner, labeled "SURGEON" in a small uppercase eyebrow, with horizontal bar meters showing "ENERGY 68", "STANDING 70", "COMPOSURE 70" in thin tabular numerals. Right half: a deep periwinkle-and-indigo surface with the same grain and glow treatment, labeled "SOFTWARE ENGINEER", with bars showing "ENERGY 85", "MOMENTUM 30", "FLOW 65", "TEAM TRUST 95". Across the very top in large bold modern sans-serif (Space Grotesk style), the words "Same you. Two very different days." in clean white. At the bottom-left a small wordmark "A Day In". The two halves should feel like living dashboards from two completely different worlds - clinical vs. quiet. No people, no photos, pure UI. Subtle vignette, very dark background, premium SaaS aesthetic, high contrast, 4K.

### Prompt 2 - The hero question (recommended Devpost thumbnail)

> A 3:2 dark cinematic poster. Background is near-black with a faint cool-blue gradient wash and very subtle film grain. Center, in large bold sans-serif (Space Grotesk style), white text reading: "Don't read about a career." On the next line, slightly smaller, in a soft teal accent color: "Live a day of it." Below in small uppercase eyebrow text: "A DAY IN - CAREER SIMULATOR". Around the edges, four very small floating UI fragments at low opacity - a glowing teal circular day-clock reading "5:02 AM", a small periwinkle bar meter labeled "FLOW 65", a warm amber tile fragment labeled "FRANTIC · 3-DAY ARC", a gold tile labeled "GRINDING · 3-DAY ARC". They hint at the careers without dominating. Minimalist, editorial, premium product launch feel.

### Prompt 3 - The four careers, as palettes

> A 3:2 dark editorial composition. Four rectangular cards arranged in a 2x2 grid on a near-black background with film grain. Each card is a different living palette: top-left deep teal with cold blue glow (label: "SURGEON · TENSE"), meters "STANDING", "THE LIST", "COMPOSURE"; top-right deep periwinkle/indigo with quiet purple glow (label: "SOFTWARE ENGINEER · QUIET"), meters "MOMENTUM", "FLOW", "TEAM TRUST"; bottom-left warm amber-on-brown with restless orange glow (label: "ELEMENTARY TEACHER · FRANTIC"), meters "THE ROOM", "RESERVE", "CAUGHT UP"; bottom-right olive-gold on dark with prestige gold glow (label: "INVESTMENT BANKING ANALYST · GRINDING"), meters "THE DECK", "REPUTATION", "LIFE LEFT". Each label is small uppercase tabular sans-serif. Inside each card, three thin horizontal bar meters at varying fill levels. Across the top, white sans-serif: "Eight grounded careers. Three-day arcs. Live the week." Bottom-right small wordmark "A Day In". Premium dashboard aesthetic, cinematic.

### Prompt 4 - The decision moment

> A 3:2 cinematic UI mockup. A dark teal hospital scene fading into deep black, with a subtle blueprint pulse-line graphic across the upper third (suggesting an EKG without being one). Center frame, in clean white sans-serif Space Grotesk: a quote-style sentence reading "5:02 AM. Fourteen patients. Rounds in twenty minutes. You haven't seen a single chart." Below it three small button-style choice tiles in dark glass with thin teal borders: "Pre-round fast", "Read every chart properly", "Flag the febrile patient now". To the right, a small glowing teal day-clock circle showing "5:00 AM · DAWN". Bottom-left wordmark "A Day In". Very dark, very moody, very legible. No photographic people, pure interface.

### Prompt 5 - The empty seat (most ambitious)

> A 3:2 cinematic dark editorial image. An empty modern operating-room corridor at 5 AM, shot through a teal cool color grade, very moody, hospital quiet. In the foreground, floating mid-air over the corridor, a translucent dark UI panel like a heads-up display showing a horizontal day-clock arc partially filled in teal, the text "5:02 AM · DAWN", and three meter bars labeled ENERGY, STANDING, THE LIST in small uppercase. Across the top in large white Space Grotesk: "What does a Tuesday actually feel like?" Small wordmark bottom-left: "A Day In". The HUD should feel like the player's interface overlaid on the real world. Cinematic, atmospheric, premium streaming-show poster aesthetic, no faces visible.

---

## Files in this submission package

- `DEVPOST.md` - this document (paste story sections into Devpost)
- `STORYBOARD.md` - shot-by-shot demo breakdown with overlays, captions, and motion notes *(primary recording guide)*
- `implementation.md` - spec vs. built audit for judges who want depth

**Demo prep:** Complete one full day as Surgeon, then one as Software Engineer in the same browser session, before filming the Compare beat.

**Note:** `DEMO_SCRIPT.md` on disk is corrupted; use `STORYBOARD.md` for the walkthrough.
