import { Career } from "../types";

// =============================================================================
// INVESTMENT BANKING ANALYST
// Grounded from: Mergers & Inquisitions IB hours, ibankingadvice "day in a
// life", managementconsulted analyst day, Vault week-in-the-life, Leland.
// Felt texture: grinding, high-status-low-control, waiting, billable face-time.
// The reality: 60-100 hr weeks; the "submit at 10:30pm → 'I'll look tomorrow'";
// 3am revisions for a 9am meeting nobody fully reads; waiting on senior bankers;
// 80 office hours ≈ 60 real-work hours of downtime + availability; eating alone
// is the only peace; mistakes in a deck that "looks bad to buyers."
// Axis: very LOW autonomy, high stakes-to-ego, money-vs-life as the core trade.
// =============================================================================

export const analyst: Career = {
  id: "analyst",
  title: "Investment Banking Analyst",
  realityLine:
    "Prestige and a huge salary, paid for in 2am deck revisions, days spent waiting on people above you, and a calendar that belongs to everyone but you.",
  mood: {
    accent: "#d8b46a",
    bgFrom: "#14110a",
    bgTo: "#211b0f",
    texture: "grinding",
    tempo: 0.6,
  },
  dayStart: 9 * 60,
  dayEndApprox: 23 * 60 + 30,
  meters: [
    {
      id: "deck",
      label: "The Deck",
      hint: "State of the live pitchbook. Always one comment from redone.",
      start: 55,
    },
    {
      id: "rep",
      label: "Reputation",
      hint: "How reliable the seniors think you are.",
      start: 50,
    },
    {
      id: "life",
      label: "Life Left",
      hint: "What remains of you outside the deal.",
      start: 60,
    },
  ],
  tensions: [
    {
      id: "control",
      label: "Take initiative vs. Wait for orders",
      poleA: "Take initiative",
      poleB: "Wait for orders",
      description:
        "Almost nothing is yours to decide; do you anticipate, or wait to be told and avoid blame?",
    },
    {
      id: "precision",
      label: "Polish vs. Speed",
      poleA: "Polish",
      poleB: "Speed",
      description:
        "A single error in a deck 'looks bad to buyers'; perfection costs hours you may not have.",
    },
    {
      id: "tradeoff",
      label: "The job vs. Your life",
      poleA: "The job",
      poleB: "Your life",
      description:
        "Money, sleep, fitness, friends -pick three. The deal is always allowed to win.",
    },
  ],
  openingBeatId: "a_open",
  beats: [
    {
      id: "a_open",
      clockAnchor: 542,
      phase: "morning",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "9:02 AM. You got in at 2am last night. Your associate's markups on last night's pitchbook are already in your inbox: 'Good enough draft. Update the remaining comments and circulate to the MDs by 11.' Mornings move slow here -slow, until they suddenly don't.",
      artifacts: [
        {
          id: "inbox",
          title: "Associate email",
          body: "Subject: CIM v47 - comments attached\n'Good enough draft. Close every comment and circulate to MDs by 11.'\n14 open comments · 3 are formatting · 1 is a model error",
        },
        {
          id: "deck",
          title: "Comment summary",
          body: "P.12: EBITDA bridge - check source\nP.28: comps table - swap multiples\nP.41: typo in footnote (buyers will see this)",
        },
      ],
      pressure: {
        label: "Circulate by",
        deadlineSeconds: 60,
        defaultChoiceId: "a_open_fast",
      },
      rank: {
        items: [
          {
            id: "meticulous",
            label: "Close every comment carefully",
            detail: "Nothing slips through. Takes the full morning.",
          },
          {
            id: "fast",
            label: "Hit the big ones, eyeball the rest",
            detail: "Buy time now; risk a sloppy slide surviving.",
          },
        ],
        topItemToChoiceId: {
          meticulous: "a_open_grind",
          fast: "a_open_fast",
        },
      },
      choices: [
        {
          id: "a_open_grind",
          label:
            "Highlighter on every comment, work through them methodically, miss nothing.",
          delta: {
            advanceMinutes: 45,
            energy: -12,
            meters: { deck: +15, rep: +8 },
            tensionId: "precision",
            pole: "A",
          },
          consequence:
            "Every comment closed, deck circulated at 10:50. The associate replies 'thx.' That single syllable is the whole reward, and you'll take it.",
        },
        {
          id: "a_open_fast",
          label:
            "Knock out the big comments, eyeball the small ones, buy yourself time.",
          delta: {
            advanceMinutes: 45,
            energy: -7,
            meters: { deck: +8, rep: -6, life: +5 },
            tensionId: "precision",
            pole: "B",
          },
          consequence:
            "Circulated early -but a formatting slip survives to the MD's screen. It's minor. It also 'looks sloppy,' and on the street, looking sloppy is the sin.",
        },
      ],
    },
    {
      id: "a_open_d2",
      clockAnchor: 542,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "9:02 AM. Day two. You left at midnight and the MD's comments on v47 landed at 6:40am: 'Rework comps, fix EBITDA bridge, circulate by 10:30.' The associate hasn't come in yet. The intern is already at your desk with coffee.",
      artifacts: [
        {
          id: "inbox",
          title: "MD markup email",
          body: "v47 REJECTED - see attached\n'Comps wrong sector. Bridge doesn't tie.'\nCirculate v48 by 10:30 or we push the client call",
        },
        {
          id: "deck",
          title: "Comment summary",
          body: "P.12: EBITDA bridge - REBUILD\nP.28: comps - wrong peer set\nP.41: footnote typo STILL THERE from yesterday",
        },
      ],
      pressure: {
        label: "Circulate by",
        deadlineSeconds: 50,
        defaultChoiceId: "a_open_fast",
      },
      rank: {
        items: [
          {
            id: "meticulous",
            label: "Fix everything - including yesterday's typo",
            detail: "No more sloppiness. You'll miss the window.",
          },
          {
            id: "fast",
            label: "Rebuild comps, eyeball the rest",
            detail: "Hit the MD's loud complaints first.",
          },
        ],
        topItemToChoiceId: {
          meticulous: "a_open_grind",
          fast: "a_open_fast",
        },
      },
      choices: [
        {
          id: "a_open_grind",
          label: "Rebuild the bridge and comps from scratch. Miss nothing.",
          delta: {
            advanceMinutes: 50,
            energy: -16,
            meters: { deck: +18, rep: +10 },
            tensionId: "precision",
            pole: "A",
          },
          consequence:
            "v48 goes out at 10:42 - late, but clean. The associate shows up at 10:30 and doesn't say thank you. Being right on day two still feels like survival.",
        },
        {
          id: "a_open_fast",
          label: "Swap the comps, patch the bridge, ship by 10:25.",
          delta: {
            advanceMinutes: 42,
            energy: -10,
            meters: { deck: +10, rep: -4, life: +3 },
            tensionId: "precision",
            pole: "B",
          },
          consequence:
            "On time. The footnote typo survives again. The MD won't forget who let sloppiness through twice.",
        },
      ],
    },
    {
      id: "a_open_d3",
      clockAnchor: 542,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "9:02 AM. Day three. Management presentation tomorrow. You slept three hours. The VP pinged at 7am: 'Full run-through tonight, no excuses.' v48 is live but the model has a sensitivity the client will ask about - and nobody has written the talking points.",
      artifacts: [
        {
          id: "inbox",
          title: "VP Teams",
          body: "7:04 · 'Run-through 8pm tonight - full team'\n7:18 · 'Client will grill the bridge - be ready'\n7:55 · 'Where are the talking points?'",
        },
        {
          id: "deck",
          title: "Open items",
          body: "Sensitivity table - not built\nTalking points - blank\nIntern out sick - you're alone on deck",
        },
      ],
      pressure: {
        label: "VP check-in",
        deadlineSeconds: 45,
        defaultChoiceId: "a_open_fast",
      },
      rank: {
        items: [
          {
            id: "meticulous",
            label: "Build sensitivity + talking points properly",
            detail: "Tonight will hurt either way. Do it right.",
          },
          {
            id: "fast",
            label: "Stub the sensitivity, draft bullet talking points",
            detail: "Good enough for the VP check-in.",
          },
        ],
        topItemToChoiceId: {
          meticulous: "a_open_grind",
          fast: "a_open_fast",
        },
      },
      choices: [
        {
          id: "a_open_grind",
          label: "Build the sensitivity table and draft real talking points.",
          delta: {
            advanceMinutes: 55,
            energy: -14,
            meters: { deck: +20, rep: +12, life: -10 },
            tensionId: "tradeoff",
            pole: "A",
          },
          consequence:
            "The VP reads your bullets and says 'good.' You know tonight is still an all-nighter - but day three starts with you ahead of the fire.",
        },
        {
          id: "a_open_fast",
          label: "Quick sensitivity stub, three bullet talking points, move.",
          delta: {
            advanceMinutes: 38,
            energy: -8,
            meters: { deck: +8, rep: -6, life: +4 },
            tensionId: "precision",
            pole: "B",
          },
          consequence:
            "VP nods through the check-in. The stub will break in the run-through tonight. Speed bought morning; precision collects interest after dark.",
        },
      ],
    },
    {
      id: "a_wait",
      clockAnchor: 750,
      phase: "midday",
      scene:
        "12:30 PM. The deck's with the MDs. Now you wait. You can't really start anything big because feedback could land any second and reshape everything. This is the part nobody warns you about: hours of being on-call to your own work, unable to leave.",
      artifacts: [
        {
          id: "teams",
          title: "Teams",
          body: "VP: 'MDs reviewing now - stay close'\nAssociate: 'if they ping, drop everything'\nOther analyst: 'lunch?'\nYou: online · desk · not moving",
        },
      ],
      choices: [
        {
          id: "a_wait_lunch",
          label:
            "Slip out for a real lunch alone -the only true peace you get.",
          delta: {
            advanceMinutes: 45,
            energy: +12,
            meters: { life: +12, rep: -3 },
            tensionId: "tradeoff",
            pole: "B",
          },
          consequence:
            "Twenty minutes of sunlight and a sandwich nobody emailed about. You come back recharged. An associate noticed you were gone -filed away, not forgotten.",
        },
        {
          id: "a_wait_prep",
          label:
            "Stay at the desk and pre-build the next analysis they'll inevitably ask for.",
          delta: {
            advanceMinutes: 45,
            energy: -8,
            meters: { rep: +12, deck: +5 },
            tensionId: "control",
            pole: "A",
          },
          consequence:
            "Feedback lands at 1:30 and you already have half the work done. The VP says 'good -thinking ahead.' Anticipation is the only initiative the hierarchy actually rewards.",
        },
        {
          id: "a_wait_idle",
          label:
            "Read the news, chat with the other analysts, stay visibly at your desk.",
          delta: {
            advanceMinutes: 45,
            energy: +3,
            meters: { rep: -2, life: +4 },
            tensionId: "control",
            pole: "B",
          },
          consequence:
            "You did the thing 80-hour weeks are secretly made of: present, available, not really working. Nobody penalizes it. Nobody rewards it. The hours count the same.",
        },
      ],
      eligibleWhen: (s) =>
        ["a_open", "a_open_d2", "a_open_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "a_mistake",
      clockAnchor: 970,
      phase: "afternoon",
      scene:
        "4:10 PM. On a call, the client flags an error -in their own projections, but it flowed into your model. The associate's jaw is tight. It's not a dealbreaker, but buyers who see it 'will be incentivized to lower their offers.' Everyone's looking at the analyst. That's you.",
      choices: [
        {
          id: "a_mis_own",
          label:
            "Own it immediately and propose the fix: 'On it -revised model in an hour.'",
          delta: {
            advanceMinutes: 45,
            energy: -14,
            meters: { rep: +14, deck: +10, life: -8 },
            tensionId: "control",
            pole: "A",
          },
          consequence:
            "You don't flinch, you don't blame the client out loud, you just fix it. The associate exhales. How you respond to a mistake matters more than the mistake -that's the actual lesson of year one.",
        },
        {
          id: "a_mis_defend",
          label:
            "Point out it originated in the client's numbers, not your work.",
          delta: {
            advanceMinutes: 30,
            energy: -6,
            meters: { rep: -10, deck: +4 },
            tensionId: "control",
            pole: "B",
          },
          consequence:
            "You're technically right. Being technically right while a senior is stressed is a way to be correct and disliked at the same time. The fix still lands on your desk.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("a_wait"),
    },
    {
      id: "a_latenight",
      clockAnchor: 1300,
      phase: "evening",
      scene:
        "9:40 PM. You submit the revised pitch and model to your associate. Thirty minutes later: 'Thx. I'll look at it tomorrow morning.' You waited two hours for that. Your intern is still here, hovering, in case of changes. Outside, your friends are at dinner you said no to. Again.",
      isFinale: true,
      choices: [
        {
          id: "a_ln_debrief",
          label:
            "Send the intern home with real thanks, plan tomorrow, leave clean.",
          delta: {
            advanceMinutes: 30,
            energy: -5,
            meters: { rep: +8, life: +5 },
            tensionId: "control",
            pole: "A",
          },
          consequence:
            "You debrief the intern, tell them they did good, and sort tomorrow's list so you're two turns ahead. Taxi home by 11:50. Seven hours till you do it again. This is the trade, eyes open.",
        },
        {
          id: "a_ln_collapse",
          label: "Just go. You're empty. Deal with the rest tomorrow.",
          delta: {
            advanceMinutes: 10,
            energy: +4,
            meters: { life: +8, rep: -4 },
            tensionId: "tradeoff",
            pole: "B",
          },
          consequence:
            "You leave the intern to figure out the exit and the morning to figure out itself. You needed this. The street remembers the analyst who's 'always on' -and you weren't, tonight. Worth it, maybe.",
        },
      ],
    },
  ],
  sources: [
    {
      title:
        "Investment Banking Hours: Schedule, Work-Life, Typical Day (Growth Equity Interview Guide)",
      url: "https://growthequityinterviewguide.com/investment-banking/investment-banking-industry/investment-banking-hours",
      grounds:
        "60-80 hr weeks, the final push to 3am, hours spent WAITING on senior bankers, weekend work.",
    },
    {
      title:
        "A day in a life of an Investment Banking Analyst (ibankingadvice.com)",
      url: "https://www.ibankingadvice.com/post/a-day-in-a-life-of-an-investment-banking-analyst",
      grounds:
        "Submit at 10:30pm → 'I'll look tomorrow'; intern waiting in case of changes; lunch alone as peace; taxi home near midnight.",
    },
    {
      title:
        "Investment Banking Analyst: A Day in the Life vs. Consulting (Management Consulted)",
      url: "https://managementconsulted.com/investment-banking-analyst-a-day-in-the-life-vs-consulting/",
      grounds:
        "Client error flowing into the model 'looks bad to buyers'; constant revisions; bosses who ignore the clock.",
    },
    {
      title:
        "Investment Banking Hours: What to Expect (Mergers & Inquisitions)",
      url: "https://mergersandinquisitions.com/investment-banking-hours/",
      grounds:
        "80 office hours ≈ 60 real-work hours (downtime + availability); 3am changes for a 9am meeting nobody reads; 'pay your dues' culture.",
    },
  ],
};
