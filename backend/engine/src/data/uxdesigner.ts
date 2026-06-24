import { Career } from "../types";

// =============================================================================
// UX DESIGNER
// Grounded from: NN/g day-in-the-life, designer job postings, critique culture
// accounts. Felt texture: ambiguous, collaborative, visual - progress is
// subjective and everyone has an opinion.
// =============================================================================

export const uxdesigner: Career = {
  id: "uxdesigner",
  title: "UX Designer",
  realityLine:
    "It's not wireframes on a whiteboard. It's five stakeholders, conflicting research, a dev team waiting, and a PM who wants it 'pop' by Friday.",
  mood: {
    accent: "#c77dff",
    bgFrom: "#120a1a",
    bgTo: "#1c1028",
    texture: "iterative",
    tempo: 0.5,
  },
  dayStart: 9 * 60,
  dayEndApprox: 18 * 60 + 30,
  meters: [
    {
      id: "clarity",
      label: "Clarity",
      hint: "How well the problem is actually understood.",
      start: 50,
    },
    {
      id: "buyin",
      label: "Buy-in",
      hint: "Stakeholders aligned on direction.",
      start: 45,
    },
    {
      id: "craft",
      label: "Craft",
      hint: "Quality of the work itself.",
      start: 60,
    },
  ],
  tensions: [
    {
      id: "evidence",
      label: "Research vs. Ship",
      poleA: "Research",
      poleB: "Ship",
      description:
        "Users need more discovery; the sprint ends Thursday anyway.",
    },
    {
      id: "voice",
      label: "Your vision vs. The room",
      poleA: "Your vision",
      poleB: "The room",
      description:
        "Design critique can sharpen work or sand it into committee mush.",
    },
    {
      id: "scope",
      label: "Polish vs. Good enough",
      poleA: "Polish",
      poleB: "Good enough",
      description: "The last 10% of pixels nobody notices - unless they do.",
    },
  ],
  openingBeatId: "ux_kickoff",
  beats: [
    {
      id: "ux_kickoff",
      clockAnchor: 545,
      phase: "morning",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "9:05 AM. Sprint kickoff. The PM wants a redesigned onboarding flow live in two weeks. Engineering says the old flow 'works fine.' You have interview notes from six users and a Figma file with twelve half-baked screens.",
      artifacts: [
        {
          id: "figma",
          title: "Figma - onboarding v3",
          body: "12 frames · 3 marked 'WIP'\nComments: PM 'needs more pop' · Eng 'too many steps'",
        },
        {
          id: "research",
          title: "Interview synthesis",
          body: "6/6 confused by step 2\n4/6 abandoned before verify email\n1 quote: 'I thought I was done'",
        },
      ],
      pressure: {
        label: "Sprint planning ends",
        deadlineSeconds: 55,
        defaultChoiceId: "ux_ko_ship",
      },
      rank: {
        items: [
          {
            id: "research",
            label: "Present the research - reset the room",
            detail: "Slow them down with evidence.",
          },
          {
            id: "prototype",
            label: "Show a clickable prototype",
            detail: "Make it feel real fast.",
          },
          {
            id: "scope",
            label: "Propose a smaller scope cut",
            detail: "Ship something true, not everything.",
          },
        ],
        topItemToChoiceId: {
          research: "ux_ko_research",
          prototype: "ux_ko_proto",
          scope: "ux_ko_ship",
        },
      },
      choices: [
        {
          id: "ux_ko_research",
          label: "Walk through the interview clips - let users speak first.",
          delta: {
            advanceMinutes: 35,
            energy: -6,
            meters: { clarity: +15, buyin: +8 },
            tensionId: "evidence",
            pole: "A",
          },
          consequence:
            "Room quiets. PM stops saying 'pop.' You bought clarity at the cost of momentum.",
        },
        {
          id: "ux_ko_proto",
          label: "Demo the prototype - show, don't tell.",
          delta: {
            advanceMinutes: 25,
            energy: -8,
            meters: { buyin: +12, craft: +6 },
            tensionId: "voice",
            pole: "A",
          },
          consequence:
            "Eng leans in. PM wants changes already. You have direction and a list of opinions.",
        },
        {
          id: "ux_ko_ship",
          label: "Cut scope to three screens - what's shippable in two weeks.",
          delta: {
            advanceMinutes: 20,
            energy: -4,
            meters: { buyin: +10, clarity: +5 },
            tensionId: "evidence",
            pole: "B",
          },
          consequence:
            "Team nods. Research sits in a doc nobody opens. You shipped a plan, not a truth.",
        },
      ],
    },
    {
      id: "ux_kickoff_d2",
      clockAnchor: 545,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "9:05 AM. Day two. Yesterday's prototype tested badly - users still lost at step 2. PM: 'Can we just add tooltips?' Eng is refactoring the auth module and doesn't want UI changes.",
      artifacts: [
        {
          id: "figma",
          title: "Test results",
          body: "3/5 failed step 2 · 2/5 succeeded with help\nPM comment: 'tooltips?'\nEng: 'auth freeze this week'",
        },
        {
          id: "research",
          title: "Slack thread",
          body: "PM: 'ship Friday anyway'\nYou: typing…\nDesigner friend: 'hold the line'",
        },
      ],
      pressure: {
        label: "Standup",
        deadlineSeconds: 50,
        defaultChoiceId: "ux_ko_ship",
      },
      rank: {
        items: [
          {
            id: "research",
            label: "Insist on one more test round",
            detail: "Friday is fiction.",
          },
          {
            id: "prototype",
            label: "Redesign step 2 tonight",
            detail: "Big swing, tight timeline.",
          },
          {
            id: "scope",
            label: "Agree to tooltips + ship",
            detail: "Live to fight next sprint.",
          },
        ],
        topItemToChoiceId: {
          research: "ux_ko_research",
          prototype: "ux_ko_proto",
          scope: "ux_ko_ship",
        },
      },
      choices: [
        {
          id: "ux_ko_research",
          label: "Schedule three more tests today - no ship without signal.",
          delta: {
            advanceMinutes: 40,
            energy: -10,
            meters: { clarity: +14, buyin: -6 },
            tensionId: "evidence",
            pole: "A",
          },
          consequence:
            "PM groans. Tests confirm step 2 is broken, not confusing. You were right; politically it cost you.",
        },
        {
          id: "ux_ko_proto",
          label: "Rework step 2 as a single screen - stay up if you have to.",
          delta: {
            advanceMinutes: 50,
            energy: -14,
            meters: { craft: +15, buyin: +8 },
            tensionId: "scope",
            pole: "A",
          },
          consequence:
            "New flow tests clean. You're exhausted. Craft won day two.",
        },
        {
          id: "ux_ko_ship",
          label: "Tooltips, minor copy, ship Friday - document debt for v2.",
          delta: {
            advanceMinutes: 22,
            energy: -5,
            meters: { buyin: +10, craft: -10 },
            tensionId: "voice",
            pole: "B",
          },
          consequence:
            "Friday ship happens. You know the metrics will look bad. Sometimes the room wins.",
        },
      ],
    },
    {
      id: "ux_kickoff_d3",
      clockAnchor: 545,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "9:05 AM. Day three. Launch review. Analytics from the soft release are mixed. VP wants a demo at 3 PM. Your body wants sleep. The work is never finished - only released.",
      artifacts: [
        {
          id: "figma",
          title: "Launch metrics",
          body: "Completion +8% · step 2 still worst drop-off\nVP: 'demo at 3 - good news only?'\nPolish list: 14 items",
        },
        {
          id: "research",
          title: "Post-ship interviews",
          body: "2 users loved it · 1 hated the tone\n'Feels corporate' - your fear",
        },
      ],
      pressure: {
        label: "VP demo",
        deadlineSeconds: 45,
        defaultChoiceId: "ux_ko_proto",
      },
      rank: {
        items: [
          {
            id: "research",
            label: "Lead with honest metrics",
            detail: "Credibility long-term.",
          },
          {
            id: "prototype",
            label: "Polish hero path for demo",
            detail: "Demo isn't the product.",
          },
          {
            id: "scope",
            label: "Pitch v2 roadmap",
            detail: "Frame the narrative.",
          },
        ],
        topItemToChoiceId: {
          research: "ux_ko_research",
          prototype: "ux_ko_proto",
          scope: "ux_ko_ship",
        },
      },
      choices: [
        {
          id: "ux_ko_research",
          label: "Present real numbers and a v2 plan - no spin.",
          delta: {
            advanceMinutes: 35,
            energy: -6,
            meters: { clarity: +12, buyin: +10 },
            tensionId: "evidence",
            pole: "A",
          },
          consequence:
            "VP pauses, then approves v2 budget. Honesty on day three bought you another swing.",
        },
        {
          id: "ux_ko_proto",
          label: "Polish the demo path - make the happy path sing.",
          delta: {
            advanceMinutes: 45,
            energy: -12,
            meters: { craft: +14, buyin: +6 },
            tensionId: "scope",
            pole: "A",
          },
          consequence:
            "Demo lands. You know the edges are still sharp. Performance is part of design too.",
        },
        {
          id: "ux_ko_ship",
          label: "Frame modest wins - protect the team from a scope explosion.",
          delta: {
            advanceMinutes: 25,
            energy: -4,
            meters: { buyin: +8, clarity: -4 },
            tensionId: "voice",
            pole: "B",
          },
          consequence:
            "Room leaves relieved. Step 2 debt is still there. You chose peace over precision.",
        },
      ],
    },
    {
      id: "ux_crit",
      clockAnchor: 660,
      phase: "midday",
      scene:
        "11:00 AM. Design critique. A senior designer says your hierarchy is 'muddy.' PM says it's 'fine.' You feel both. The clock on the wall says you have until 1 PM to incorporate feedback.",
      choices: [
        {
          id: "ux_cr_absorb",
          label: "Take the notes - rework hierarchy before lunch.",
          delta: {
            advanceMinutes: 90,
            energy: -12,
            meters: { craft: +14, buyin: +4 },
            tensionId: "scope",
            pole: "A",
          },
          consequence:
            "Afternoon version is cleaner. Your eyes hurt. Critique worked; ego stung.",
        },
        {
          id: "ux_cr_push",
          label: "Defend the structure - ask for specific user evidence.",
          delta: {
            advanceMinutes: 45,
            energy: -6,
            meters: { clarity: +8, buyin: -6 },
            tensionId: "voice",
            pole: "A",
          },
          consequence:
            "Senior backs down - no data. PM annoyed at the friction. Your vision survived.",
        },
      ],
      eligibleWhen: (s) =>
        ["ux_kickoff", "ux_kickoff_d2", "ux_kickoff_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "ux_handoff",
      clockAnchor: 870,
      phase: "afternoon",
      scene:
        "2:30 PM. Handoff to engineering. Your specs are 80% there. A dev asks 'what happens on slow network?' You hadn't thought about it. Someone always asks.",
      choices: [
        {
          id: "ux_ho_spec",
          label: "Pause handoff - spec the edge cases properly.",
          delta: {
            advanceMinutes: 50,
            energy: -8,
            meters: { craft: +12, buyin: +8 },
            tensionId: "scope",
            pole: "A",
          },
          consequence:
            "Eng trusts you more. Sprint slips a day. Quality is a schedule negotiation.",
        },
        {
          id: "ux_ho_pair",
          label: "Pair with the dev for an hour - figure it out together.",
          delta: {
            advanceMinutes: 60,
            energy: -10,
            meters: { buyin: +14, clarity: +6 },
            tensionId: "voice",
            pole: "B",
          },
          consequence:
            "Solution is pragmatic, not pretty. Relationship is stronger. Design happened in conversation.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("ux_crit"),
    },
    {
      id: "ux_close",
      clockAnchor: 1050,
      phase: "evening",
      scene:
        "5:30 PM. Slack is quiet. Figma is still open. You could nudge one more pixel or close the laptop and be a person. The onboarding will never feel done - only shipped.",
      isFinale: true,
      choices: [
        {
          id: "ux_cl_polish",
          label:
            "One more pass on spacing and copy - future you will thank you.",
          delta: {
            advanceMinutes: 40,
            energy: -8,
            meters: { craft: +12, clarity: +4 },
            tensionId: "scope",
            pole: "A",
          },
          consequence:
            "You leave at 6:20 satisfied with the file. The job steals evenings in small increments.",
        },
        {
          id: "ux_cl_leave",
          label: "Ship what you have. Walk away.",
          delta: {
            advanceMinutes: 10,
            energy: +8,
            meters: { craft: -4, buyin: +2 },
            tensionId: "evidence",
            pole: "B",
          },
          consequence:
            "Laptop closed. Tomorrow's critique will find something. You chose a life anyway.",
        },
      ],
    },
  ],
  sources: [
    {
      title: "A Day in the Life of a UX Designer (Nielsen Norman Group)",
      url: "https://www.nngroup.com/articles/day-in-life-ux-designer/",
      grounds: "Research, critique, stakeholder meetings, dev handoff.",
    },
    {
      title: "Design Critique Best Practices (IDEO)",
      url: "https://www.ideo.com/",
      grounds: "Feedback culture, defending design decisions.",
    },
    {
      title: "The UX Research vs. Delivery Tension (Smashing Magazine)",
      url: "https://www.smashingmagazine.com/",
      grounds: "Shipping under pressure, scope cuts, iterative release.",
    },
  ],
};
