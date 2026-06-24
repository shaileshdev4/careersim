import { Career } from "../types";

// =============================================================================
// SURGEON (surgical resident)
// Grounded from: Henry Ford Ortho residency "Day in the Life", militarydoc.com
// surgical-resident account, MedResidency expectations-vs-reality, ACS guide.
// Felt texture: tense, clinical, hierarchical, physically punishing, NO drama.
// The reality these sources insist on: it is structured and repetitive, not
// Grey's Anatomy; the hard parts are early hours, the list, standing for hours,
// and sleep loss -not heroic monologues.
// =============================================================================

export const surgeon: Career = {
  id: "surgeon",
  title: "Surgeon",
  realityLine:
    "It is not Grey's Anatomy. It's 5am rounds, hours standing in lead, a rigid hierarchy, and running on four hours of sleep -and somewhere in there, someone's life in your hands.",
  mood: {
    accent: "#36c2cf",
    bgFrom: "#04141a",
    bgTo: "#072830",
    texture: "tense",
    tempo: 0.7,
  },
  dayStart: 5 * 60, // 5:00 AM
  dayEndApprox: 19 * 60,
  meters: [
    {
      id: "standing",
      label: "Standing",
      hint: "Where you rank with the attending and the team.",
      start: 50,
    },
    {
      id: "list",
      label: "The List",
      hint: "Patients accounted for. Falling behind has consequences.",
      start: 60,
    },
    {
      id: "control",
      label: "Composure",
      hint: "Steadiness under pressure and fatigue.",
      start: 70,
    },
  ],
  tensions: [
    {
      id: "stakes",
      label: "Decisiveness vs. Caution",
      poleA: "Decisiveness",
      poleB: "Caution",
      description:
        "Bodies are on the line; sometimes you must act fast, sometimes a pause saves a life.",
    },
    {
      id: "hierarchy",
      label: "Deference vs. Voice",
      poleA: "Deference",
      poleB: "Voice",
      description:
        "A rigid chain of command -when do you defer to the attending, and when do you speak up?",
    },
    {
      id: "stamina",
      label: "Pushing through vs. Protecting yourself",
      poleA: "Pushing through",
      poleB: "Protecting yourself",
      description:
        "Long hours standing on little sleep; grind it out or guard your own limits.",
    },
  ],
  openingBeatId: "s_rounds",
  beats: [
    {
      id: "s_rounds",
      clockAnchor: 302,
      phase: "dawn",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "5:02 AM. You badge in while the city is still dark. The overnight resident is waiting to hand off the list -fourteen patients, one of them post-op and spiking a fever. Rounds with the chief start in twenty minutes, and you haven't seen a single chart yet.",
      artifacts: [
        {
          id: "handoff",
          title: "Overnight handoff",
          body: "Febrile post-op in 412 -T 38.4, wound erythema. Six stable post-ops need only quick checks. New ICU consult faxed at 4:50am, not yet assigned. Chief expects everyone pre-rounded before 5:25.",
        },
        {
          id: "list",
          title: "Patient list (14)",
          body: "Rm 412 · M 67 · POD#2 hip · FEVER\nRm 318 · F 54 · POD#1 knee · stable\nRm 220 · M 41 · POD#3 ACL · stable\n… +11 more on the printed list, charts not opened yet.",
        },
      ],
      pressure: {
        label: "Rounds start in",
        deadlineSeconds: 50,
        defaultChoiceId: "s_rounds_fast",
      },
      rank: {
        items: [
          {
            id: "febrile",
            label: "Rm 412 -febrile post-op",
            detail: "Spiking overnight; wound looks angry on handoff.",
          },
          {
            id: "stable",
            label: "Six routine post-ops",
            detail: "Boring charts -but the chief will quiz every one.",
          },
          {
            id: "consult",
            label: "New ICU consult",
            detail: "Faxed at 4:50am; nobody has claimed it yet.",
          },
        ],
        topItemToChoiceId: {
          febrile: "s_rounds_fast",
          stable: "s_rounds_thorough",
          consult: "s_rounds_ask",
        },
      },
      choices: [
        {
          id: "s_rounds_fast",
          label:
            "Pre-round fast -eyeball the sickest patient first, skim the rest.",
          delta: {
            advanceMinutes: 25,
            energy: -8,
            meters: { list: +10, standing: +5 },
            tensionId: "stakes",
            pole: "A",
          },
          consequence:
            "You catch the fever and a low urine output before the chief asks. You look sharp -but you're already moving, and you haven't eaten.",
        },
        {
          id: "s_rounds_thorough",
          label: "Read every chart properly. Be late to rounds if you have to.",
          delta: {
            advanceMinutes: 40,
            energy: -6,
            meters: { list: +15, standing: -10 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "Your notes are airtight. But you walk into rounds six minutes late, and the chief notices. In this hierarchy, late is a mark.",
        },
        {
          id: "s_rounds_ask",
          label: "Flag the febrile patient to the chief now, before rounds.",
          delta: {
            advanceMinutes: 15,
            energy: -4,
            meters: { standing: +8, control: +5 },
            tensionId: "hierarchy",
            pole: "B",
          },
          consequence:
            "The chief appreciates the heads-up and adjusts the plan early. Speaking up paid off -this time.",
        },
      ],
    },
    {
      id: "s_rounds_d2",
      clockAnchor: 302,
      phase: "dawn",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "5:02 AM. Day two. You slept maybe four hours and the febrile patient from yesterday is worse on the overnight signout - temp 39.1, wound drainage. The chief texted at 4:15: 'Be ready to talk 412 at rounds.' Your hands already feel slower than yesterday.",
      artifacts: [
        {
          id: "handoff",
          title: "Overnight signout",
          body: "Rm 412 · FEVER WORSENING · cultures pending\nAttending wants plan at rounds, not excuses\nYou ended yesterday at low energy - the list remembers",
        },
        {
          id: "list",
          title: "Patient list (14)",
          body: "412 flagged RED at top\n+2 new admits overnight\nChief expects everyone pre-rounded before 5:25",
        },
      ],
      pressure: {
        label: "Rounds start in",
        deadlineSeconds: 45,
        defaultChoiceId: "s_rounds_fast",
      },
      rank: {
        items: [
          {
            id: "febrile",
            label: "Rm 412 - worsening infection",
            detail: "The attending is watching this one now.",
          },
          {
            id: "stable",
            label: "Routine post-ops",
            detail: "Still need charts - but 412 is the landmine.",
          },
          {
            id: "consult",
            label: "New admit in ED",
            detail: "Nobody has claimed it; it'll land on someone.",
          },
        ],
        topItemToChoiceId: {
          febrile: "s_rounds_fast",
          stable: "s_rounds_thorough",
          consult: "s_rounds_ask",
        },
      },
      choices: [
        {
          id: "s_rounds_fast",
          label: "Pre-round 412 first - you know the chief will ask about it.",
          delta: {
            advanceMinutes: 25,
            energy: -12,
            meters: { list: +12, standing: +6 },
            tensionId: "stakes",
            pole: "A",
          },
          consequence:
            "You walk in with a real plan for 412. The chief nods once - rare praise. You're already running on fumes from yesterday.",
        },
        {
          id: "s_rounds_thorough",
          label: "Read every chart again - you can't afford another miss.",
          delta: {
            advanceMinutes: 40,
            energy: -10,
            meters: { list: +15, standing: -8 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "Your notes are solid but you're six minutes late again. Day two and the hierarchy already has a story about you.",
        },
        {
          id: "s_rounds_ask",
          label: "Page the attending about 412 before you even badge in.",
          delta: {
            advanceMinutes: 15,
            energy: -6,
            meters: { standing: +10, control: +6 },
            tensionId: "hierarchy",
            pole: "B",
          },
          consequence:
            "The attending adjusts the plan before rounds. Speaking up on day two feels different - you're not new anymore, you're accountable.",
        },
      ],
    },
    {
      id: "s_rounds_d3",
      clockAnchor: 302,
      phase: "dawn",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "5:02 AM. Day three. Your body is negotiating with you - calves cramping, eyes gritty. 412 is stable after two hard days but you're on call tonight. The overnight resident looks at you like you're the senior now. You're not sure you are.",
      artifacts: [
        {
          id: "handoff",
          title: "Overnight handoff",
          body: "412 stable on antibiotics · you know this chart cold\nTonight: you're on call until 7am tomorrow\nTwo co-residents out sick - thinner coverage",
        },
        {
          id: "list",
          title: "Patient list (16)",
          body: "List grew again · 2 discharges pending\nYour signout notes from day 1 are still in the chart",
        },
      ],
      pressure: {
        label: "Rounds start in",
        deadlineSeconds: 40,
        defaultChoiceId: "s_rounds_fast",
      },
      rank: {
        items: [
          {
            id: "febrile",
            label: "412 follow-up - prove you're on it",
            detail:
              "Three days on the same patient. The attending will drill you.",
          },
          {
            id: "stable",
            label: "New admits + discharges",
            detail: "The list won't wait for you to feel human.",
          },
          {
            id: "consult",
            label: "Prep for tonight's call",
            detail: "Mental bandwidth now, or pay at 2am.",
          },
        ],
        topItemToChoiceId: {
          febrile: "s_rounds_fast",
          stable: "s_rounds_thorough",
          consult: "s_rounds_ask",
        },
      },
      choices: [
        {
          id: "s_rounds_fast",
          label: "Lead with 412 - own the patient you've carried all week.",
          delta: {
            advanceMinutes: 25,
            energy: -14,
            meters: { list: +14, standing: +8 },
            tensionId: "stakes",
            pole: "A",
          },
          consequence:
            "You present 412 like you've been there three days - because you have. The team trusts your read. Trust costs energy you don't have.",
        },
        {
          id: "s_rounds_thorough",
          label: "Slow down. Read everything. You're too tired to rush.",
          delta: {
            advanceMinutes: 42,
            energy: -8,
            meters: { list: +12, control: +8 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "You catch a drug interaction nobody flagged. Caution saved a patient - and made you late. On day three, both feel like wins.",
        },
        {
          id: "s_rounds_ask",
          label: "Ask the chief how to triage before call night.",
          delta: {
            advanceMinutes: 18,
            energy: -5,
            meters: { standing: +6, control: +10 },
            tensionId: "hierarchy",
            pole: "B",
          },
          consequence:
            "The chief gives you a real plan for call. Asking for help on day three isn't weakness - it's how people survive residency.",
        },
      ],
    },
    {
      id: "s_or_scrub",
      clockAnchor: 450,
      phase: "morning",
      scene:
        "7:30 AM. First case. You scrub in on a hip replacement -your job is to retract, suction, and not contaminate the field. The attending barely speaks. The reality nobody films: you will stand mostly silent in lead for the next three hours.",
      choices: [
        {
          id: "s_or_focus",
          label: "Lock in. Anticipate every instrument before it's asked for.",
          delta: {
            advanceMinutes: 60,
            energy: -32,
            meters: { standing: +15, control: +5 },
            tensionId: "stamina",
            pole: "A",
          },
          consequence:
            "By hour three your lower back is screaming and your feet have gone numb -but the attending says 'good hands.' Worth more than it sounds.",
        },
        {
          id: "s_or_shift",
          label:
            "Shift your weight, sip nothing, let your mind wander between steps.",
          delta: {
            advanceMinutes: 60,
            energy: -12,
            meters: { standing: -8, control: -5 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "You make it through with more in the tank -but you miss a retractor cue and the attending's jaw tightens. Standing is recovered; standing-in-the-room is not.",
        },
      ],
      eligibleWhen: (s) =>
        ["s_rounds", "s_rounds_d2", "s_rounds_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "s_complication",
      clockAnchor: 700,
      phase: "midday",
      scene:
        "11:40 AM. Mid-case, the field starts to bleed more than it should. The attending is concentrating hard and hasn't said anything. You see it before they acknowledge it. The room is quiet except for the monitors.",
      choices: [
        {
          id: "s_comp_speak",
          label: "Say it out loud: 'More bleeding than expected here.'",
          delta: {
            advanceMinutes: 20,
            energy: -6,
            meters: { standing: +12, control: +8 },
            tensionId: "hierarchy",
            pole: "B",
          },
          consequence:
            "The attending looks, nods once, and calls for a clamp. You broke the silence at the right moment. That is the whole job, sometimes.",
        },
        {
          id: "s_comp_wait",
          label:
            "They've seen more than you. Hold position and trust the chain.",
          delta: {
            advanceMinutes: 20,
            energy: -4,
            meters: { control: -10, standing: -5 },
            tensionId: "hierarchy",
            pole: "A",
          },
          consequence:
            "The attending catches it a beat later -fine, no harm. But afterward they ask quietly, 'You saw that, didn't you?' Deference has a cost too.",
        },
      ],
      eligibleWhen: (s) =>
        s.visited.includes("s_or_scrub") && s.meters.control >= 40,
      priority: 2,
    },
    {
      id: "s_fatigue",
      clockAnchor: 890,
      phase: "afternoon",
      scene:
        "2:50 PM. You've been up since 4:30 and on your feet for nine hours. There's a consult in the ED and post-op notes piling up. Your hands aren't quite as steady as this morning and you know it.",
      choices: [
        {
          id: "s_fat_push",
          label: "Grab a coffee, take the consult, push through the wall.",
          delta: {
            advanceMinutes: 45,
            energy: -18,
            meters: { list: +12, standing: +6 },
            tensionId: "stamina",
            pole: "A",
          },
          consequence:
            "You clear the consult and stay ahead of the list. The cost is invisible now and very real tonight.",
        },
        {
          id: "s_fat_nap",
          label:
            "Find an empty call room and take a hard ten-minute nap first.",
          delta: {
            advanceMinutes: 30,
            energy: +14,
            meters: { list: -8, control: +10 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "Ten minutes flat on your back resets your hands and your head. The list slipped a little, but you're safe to operate. Senior residents do this on purpose.",
        },
        {
          id: "s_fat_handoff",
          label:
            "Ask a co-resident to grab the consult so you can clear notes.",
          delta: {
            advanceMinutes: 45,
            energy: -6,
            meters: { standing: -5, list: +10 },
            tensionId: "hierarchy",
            pole: "B",
          },
          consequence:
            "They cover you -co-residents are family on a service like this. You'll owe one back, and the ledger is always remembered.",
        },
      ],
      eligibleWhen: (s) => s.energy <= 70,
      priority: 3,
    },
    {
      id: "s_signout",
      clockAnchor: 1120,
      phase: "evening",
      scene:
        "6:40 PM. You update the list one last time and run it by the on-call resident for the night. Tomorrow starts at 5 again. The fever patient from this morning is stable. Nobody clapped. Nobody will.",
      isFinale: true,
      choices: [
        {
          id: "s_out_thorough",
          label: "Hand off in full detail -every contingency spelled out.",
          delta: {
            advanceMinutes: 25,
            energy: -5,
            meters: { standing: +8, list: +10 },
            tensionId: "stakes",
            pole: "B",
          },
          consequence:
            "The night resident thanks you for an airtight signout. No drama, no glory -just a patient who's safer because you were careful. That's the actual job.",
        },
        {
          id: "s_out_fast",
          label: "Hit the highlights and get home -you're wrecked.",
          delta: {
            advanceMinutes: 10,
            energy: -2,
            meters: { standing: -4, control: -4 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "You're in your car by 7. Somewhere around midnight your phone buzzes -a question you could have pre-empted. The day doesn't really end.",
        },
      ],
    },
  ],
  sources: [
    {
      title:
        "A Day in the Life -Orthopedic Surgery Residency (Henry Ford Health)",
      url: "https://www.henryford.com/HCP/Med-Ed/Residencies-Fellowships/Macomb/Ortho/Day-in-the-Life",
      grounds:
        "5am rounds, running the list, OR roles (retract/drape/assist), signout to on-call resident.",
    },
    {
      title: "A Day in the Life of a Surgical Resident (militarydoc.com)",
      url: "https://militarydoc.com/2020/07/22/a-day-in-the-life-of-a-surgical-resident/",
      grounds:
        "Grey's-Anatomy expectation vs. mundane reality; 4-5 hours sleep; cases running long.",
    },
    {
      title:
        "Life as a Medical Resident: Expectations vs Reality (MedResidency)",
      url: "https://medresidency.com/life-as-a-medical-resident-expectations-vs-reality",
      grounds:
        "Early start, overnight handoff, 'structured and repetitive, no drama' texture.",
    },
    {
      title: "Day in the Life -Orthopedic Surgery Resident (Residency Advisor)",
      url: "https://residencyadvisor.com/resources/choosing-surgical-residency/day-in-the-life-orthopedic-surgery-resident",
      grounds:
        "Physical fatigue standing in lead, hierarchy, co-residents as family, call-room naps.",
    },
  ],
};
