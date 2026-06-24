import { Career } from "../types";

// =============================================================================
// SOFTWARE ENGINEER
// Grounded from: The Coding Diaries (Medium) realistic day, Quora "code is
// invisible" answer, careervillage SE day-to-day, proresumes unfiltered.
// Felt texture: quiet, ambiguous, autonomous, INVISIBLE progress. The reality
// these sources insist on: coding is 20-50% of the day; the rest is meetings,
// PR review, Jira; progress is genuinely un-seeable ("first 90% takes 90%, last
// 10% takes another 90%"); nobody is watching you, for better and worse.
// Deliberate axis-opposite of the surgeon: low stakes-per-minute, high
// ambiguity, high autonomy, slow burn.
// =============================================================================

export const engineer: Career = {
  id: "engineer",
  title: "Software Engineer",
  realityLine:
    "It's not furious hacking. It's a standup, three hours of meetings, a bug that won't reproduce, and the strange loneliness of work no one can see you doing.",
  mood: {
    accent: "#8b8ff5",
    bgFrom: "#0c0d18",
    bgTo: "#15162a",
    texture: "quiet",
    tempo: 0.3,
  },
  dayStart: 9 * 60 + 30,
  dayEndApprox: 18 * 60 + 30,
  meters: [
    {
      id: "momentum",
      label: "Momentum",
      hint: "Real progress on the actual task -often invisible.",
      start: 40,
    },
    {
      id: "focus",
      label: "Flow",
      hint: "Uninterrupted depth. Meetings shred it.",
      start: 65,
    },
    {
      id: "trust",
      label: "Team Trust",
      hint: "How much your team relies on you.",
      start: 55,
    },
  ],
  tensions: [
    {
      id: "ambiguity",
      label: "Ship it vs. Get it right",
      poleA: "Ship it",
      poleB: "Get it right",
      description:
        "The spec is vague and the 'last 10%' hides forever; do you cut it or chase correctness?",
    },
    {
      id: "autonomy",
      label: "Heads-down vs. Sync up",
      poleA: "Heads-down",
      poleB: "Sync up",
      description:
        "Nobody's watching -you can disappear into the code or spend the day unblocking others.",
    },
    {
      id: "visibility",
      label: "Quiet work vs. Visible work",
      poleA: "Quiet work",
      poleB: "Visible work",
      description:
        "Progress is unseeable; do the real work, or do the work that looks like work?",
    },
  ],
  openingBeatId: "e_standup",
  beats: [
    {
      id: "e_standup",
      clockAnchor: 571,
      phase: "morning",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "9:31 AM. Standup in four minutes. You're supposed to say what you did yesterday -but yesterday was eight hours chasing a bug you didn't fix. 'Still investigating' is technically true and quietly humiliating. Your coffee's still too hot.",
      artifacts: [
        {
          id: "slack",
          title: "#eng-standup",
          body: "9:27 · Priya: 'anyone looked at checkout 500s?'\n9:29 · You: typing…\n9:30 · Manager: 'standup in 4, please have updates ready'",
        },
        {
          id: "ticket",
          title: "ENG-4821",
          body: "Intermittent 500 on checkout · prod only · no local repro\nLast comment: 'still investigating' (you, yesterday 4pm)\nSprint board: item is blocking release",
        },
      ],
      pressure: {
        label: "Standup starts in",
        deadlineSeconds: 55,
        defaultChoiceId: "e_su_spin",
      },
      rank: {
        items: [
          {
            id: "honest",
            label: "Tell the truth about the bug",
            detail: "Admit it's still broken - risky in front of the team.",
          },
          {
            id: "spin",
            label: "Frame it as near-done",
            detail: "Sounds productive; creates a deadline you may not hit.",
          },
          {
            id: "flow",
            label: "Protect your morning deep work",
            detail: "One-line update, back to the editor fast.",
          },
        ],
        topItemToChoiceId: {
          honest: "e_su_honest",
          spin: "e_su_spin",
          flow: "e_su_skip",
        },
      },
      choices: [
        {
          id: "e_su_honest",
          label:
            "Say it straight: 'Still on the bug, it's deeper than I thought.'",
          delta: {
            advanceMinutes: 20,
            energy: -3,
            meters: { trust: +8, momentum: -2 },
            tensionId: "visibility",
            pole: "A",
          },
          consequence:
            "A senior nods -'yeah, that subsystem's cursed, ping me.' Honesty about invisible work is rarer and more valued than it feels.",
        },
        {
          id: "e_su_spin",
          label: "Frame it as progress: 'Narrowed it down, close to a fix.'",
          delta: {
            advanceMinutes: 20,
            energy: -4,
            meters: { trust: -5, focus: +3 },
            tensionId: "visibility",
            pole: "B",
          },
          consequence:
            "It sounds good in the meeting. But now you've promised a fix today on a bug you don't understand. The performance becomes the deadline.",
        },
        {
          id: "e_su_skip",
          label: "Keep it to one line and protect your morning flow.",
          delta: {
            advanceMinutes: 8,
            energy: -1,
            meters: { focus: +8, trust: -2 },
            tensionId: "autonomy",
            pole: "A",
          },
          consequence:
            "You're out in ninety seconds and back in your editor while your brain is still fresh. Morning focus is the scarcest resource you have.",
        },
      ],
    },
    {
      id: "e_standup_d2",
      clockAnchor: 571,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "9:31 AM. Day two. Yesterday's 'close to a fix' is today's lie - the bug is still in prod and Priya DM'd you at 8:47 asking for a real ETA. Standup in four minutes. Your manager is on the call today.",
      artifacts: [
        {
          id: "slack",
          title: "#eng-standup",
          body: "8:47 · Priya: 'checkout still 500ing - any ETA?'\n9:12 · Manager: 'I'll join standup today'\n9:30 · You: still typing…",
        },
        {
          id: "ticket",
          title: "ENG-4821",
          body: "Status: still broken · error rate up overnight\nSprint board: BLOCKING RELEASE\nYour yesterday comment: 'narrowed it down'",
        },
      ],
      pressure: {
        label: "Standup starts in",
        deadlineSeconds: 50,
        defaultChoiceId: "e_su_spin",
      },
      rank: {
        items: [
          {
            id: "honest",
            label: "Own that it's still broken",
            detail: "Manager is listening - honesty is risky.",
          },
          {
            id: "spin",
            label: "Buy another day with optimism",
            detail: "Third time's the charm on promises.",
          },
          {
            id: "flow",
            label: "Minimize and dive back in",
            detail: "Less talk, more debugging.",
          },
        ],
        topItemToChoiceId: {
          honest: "e_su_honest",
          spin: "e_su_spin",
          flow: "e_su_skip",
        },
      },
      choices: [
        {
          id: "e_su_honest",
          label:
            "Admit it's still broken and ask for help pairing on PaymentAdapter.",
          delta: {
            advanceMinutes: 22,
            energy: -5,
            meters: { trust: +10, momentum: -4 },
            tensionId: "visibility",
            pole: "A",
          },
          consequence:
            "The manager doesn't flinch - assigns a senior for an hour. Yesterday's spin bought you nothing; honesty bought you air cover.",
        },
        {
          id: "e_su_spin",
          label: "Double down: 'Found the subsystem, fix today.'",
          delta: {
            advanceMinutes: 20,
            energy: -8,
            meters: { trust: -10, focus: +2 },
            tensionId: "visibility",
            pole: "B",
          },
          consequence:
            "The manager writes it down. You now have a public deadline on a bug you still don't understand. Day two and the performance is the job.",
        },
        {
          id: "e_su_skip",
          label:
            "One line, mute, open the trace before anyone asks follow-ups.",
          delta: {
            advanceMinutes: 8,
            energy: -2,
            meters: { focus: +6, trust: -4 },
            tensionId: "autonomy",
            pole: "A",
          },
          consequence:
            "You're debugging before the meeting ends. The manager notices the dodge - but you might actually find it today.",
        },
      ],
    },
    {
      id: "e_standup_d3",
      clockAnchor: 571,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "9:31 AM. Day three. Demo is tomorrow. The bug is either fixed or you're the reason the release slips. You dreamed about stack traces. Standup in four minutes and the whole eng org is on this channel now.",
      artifacts: [
        {
          id: "slack",
          title: "#eng-release",
          body: "9:15 · VP Eng: 'where are we on checkout?'\n9:28 · Manager: @you - need status in standup\n9:30 · Ticket ENG-4821: P0",
        },
        {
          id: "ticket",
          title: "ENG-4821",
          body: "P0 · demo blocker · 3 days open\nYou have a partial fix on a branch - not tested in prod\nRollback is on the table",
        },
      ],
      pressure: {
        label: "Standup starts in",
        deadlineSeconds: 45,
        defaultChoiceId: "e_su_spin",
      },
      rank: {
        items: [
          {
            id: "honest",
            label: "Present the real status - fix, rollback, or slip",
            detail: "The room needs truth, not theater.",
          },
          {
            id: "spin",
            label: "Sound confident; buy time to test",
            detail: "One more hour might be enough.",
          },
          {
            id: "flow",
            label: "Skip the theater; ship or rollback quietly",
            detail: "Let the diff speak.",
          },
        ],
        topItemToChoiceId: {
          honest: "e_su_honest",
          spin: "e_su_spin",
          flow: "e_su_skip",
        },
      },
      choices: [
        {
          id: "e_su_honest",
          label:
            "Lay out three options: hotfix today, rollback, or slip the demo.",
          delta: {
            advanceMinutes: 25,
            energy: -6,
            meters: { trust: +12, momentum: +5 },
            tensionId: "ambiguity",
            pole: "B",
          },
          consequence:
            "The VP pauses, then says 'rollback if not green by 2.' Clear stakes. You finally have a decision instead of a performance.",
        },
        {
          id: "e_su_spin",
          label: "Announce you're merging the fix after lunch.",
          delta: {
            advanceMinutes: 20,
            energy: -10,
            meters: { trust: -8, focus: -5 },
            tensionId: "visibility",
            pole: "B",
          },
          consequence:
            "The channel exhales. You have until lunch to be right. Three days of spinning and it comes down to one merge.",
        },
        {
          id: "e_su_skip",
          label: "Post your branch link and stay silent - work, don't talk.",
          delta: {
            advanceMinutes: 6,
            energy: -3,
            meters: { focus: +10, trust: +2 },
            tensionId: "autonomy",
            pole: "A",
          },
          consequence:
            "People click the diff. The fix is real but fragile. Quiet work on day three might be the only honest move left.",
        },
      ],
    },
    {
      id: "e_thebug",
      clockAnchor: 615,
      phase: "morning",
      scene:
        "10:15 AM. The bug. It only happens in production, never on your machine, and the stack trace points at code you didn't write. This is the actual job -not typing fast, but sitting very still inside a problem that refuses to make sense.",
      artifacts: [
        {
          id: "trace",
          title: "Stack trace",
          body: "NullPointerException at CheckoutService.java:284\nCalled from PaymentAdapter (not your team)\nRepro rate: ~3% of prod traffic · staging: clean",
        },
        {
          id: "dashboard",
          title: "Prod metrics",
          body: "Error rate spiked 2.1% → 4.8% since deploy #8821\nNo customer tickets yet · on-call rotation: you",
        },
      ],
      choices: [
        {
          id: "e_bug_deep",
          label:
            "Go deep. Add logging, reproduce it properly, understand the root cause.",
          delta: {
            advanceMinutes: 60,
            energy: -16,
            meters: { momentum: +18, focus: -5 },
            tensionId: "ambiguity",
            pole: "B",
          },
          consequence:
            "Two hours gone. From the outside you produced nothing -no commits, no visible output. Inside, you finally understand it. That's the 'first 90%.'",
        },
        {
          id: "e_bug_patch",
          label: "Patch the symptom now, open a ticket for the real fix later.",
          delta: {
            advanceMinutes: 45,
            energy: -8,
            meters: { momentum: +10, trust: -4 },
            tensionId: "ambiguity",
            pole: "A",
          },
          consequence:
            "Prod is green again in 45 minutes. The 'later' ticket joins forty others that say the same thing. It works. It's also how the subsystem got cursed.",
        },
        {
          id: "e_bug_ask",
          label:
            "Pull in the engineer who wrote it for a 20-minute pairing session.",
          delta: {
            advanceMinutes: 30,
            energy: -5,
            meters: { trust: +10, momentum: +8 },
            tensionId: "autonomy",
            pole: "B",
          },
          consequence:
            "They know exactly what it is in ten minutes. You feel slightly less heroic and the bug is dead. Asking was the senior move all along.",
        },
      ],
      eligibleWhen: (s) =>
        ["e_standup", "e_standup_d2", "e_standup_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "e_meetings",
      clockAnchor: 780,
      phase: "midday",
      scene:
        "1:00 PM. Three meetings back-to-back land on your calendar: a design review, a 'quick sync,' and a planning session. None of them strictly need you. But this is where decisions get made -and where the day's flow goes to die.",
      choices: [
        {
          id: "e_meet_all",
          label: "Attend all three. Be in the room where decisions happen.",
          delta: {
            advanceMinutes: 60,
            energy: -14,
            meters: { trust: +12, focus: -25 },
            tensionId: "autonomy",
            pole: "B",
          },
          consequence:
            "You shape two decisions that would've hurt you later. But it's 3:30 and you've written zero lines of code. The visible-work paradox of senior life.",
        },
        {
          id: "e_meet_decline",
          label: "Decline two, mark yourself heads-down, send notes async.",
          delta: {
            advanceMinutes: 45,
            energy: -6,
            meters: { focus: +15, trust: -8 },
            tensionId: "visibility",
            pole: "A",
          },
          consequence:
            "You reclaim a real focus block and actually ship. A decision gets made in your absence that you'll have to relitigate next week. Trade-off, not a free lunch.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("e_thebug"),
    },
    {
      id: "e_pr",
      clockAnchor: 945,
      phase: "afternoon",
      scene:
        "3:45 PM. A teammate's pull request is waiting on your review -600 lines, and something about the approach is subtly wrong. They've clearly worked hard on it. They need it merged today to hit their own commitment.",
      choices: [
        {
          id: "e_pr_block",
          label:
            "Request changes. The approach will cause problems and you can see them.",
          delta: {
            advanceMinutes: 40,
            energy: -7,
            meters: { trust: +6, momentum: -3 },
            tensionId: "ambiguity",
            pole: "B",
          },
          consequence:
            "They're frustrated today and grateful in three weeks when the thing you flagged doesn't blow up. Code review is a slow-acting form of care.",
        },
        {
          id: "e_pr_approve",
          label:
            "Approve with a soft comment. They're under pressure; it's not catastrophic.",
          delta: {
            advanceMinutes: 15,
            energy: -2,
            meters: { trust: +4, momentum: +2 },
            tensionId: "visibility",
            pole: "A",
          },
          consequence:
            "Merged, everyone's happy, you kept the peace. The subtle wrongness is now in the codebase, quietly waiting. You'll meet it again.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("e_thebug"),
      priority: 2,
    },
    {
      id: "e_endofday",
      clockAnchor: 1095,
      phase: "evening",
      scene:
        "6:15 PM. Most people have logged off. The office (or your apartment) is quiet. You finally have an uninterrupted hour and the bug from this morning is so close to fully understood. Nobody would know if you stopped now.",
      isFinale: true,
      choices: [
        {
          id: "e_eod_finish",
          label:
            "Stay the extra hour and actually finish it while it's all in your head.",
          delta: {
            advanceMinutes: 45,
            energy: -12,
            meters: { momentum: +20, focus: +5 },
            tensionId: "ambiguity",
            pole: "B",
          },
          consequence:
            "At 7:25 it clicks and the fix is clean. No one saw the eight hours it took. You close the laptop with the specific quiet satisfaction only this job gives.",
        },
        {
          id: "e_eod_stop",
          label:
            "Stop. Protect the boundary. The bug will still be there tomorrow.",
          delta: {
            advanceMinutes: 10,
            energy: +6,
            meters: { focus: +8, momentum: -2 },
            tensionId: "visibility",
            pole: "A",
          },
          consequence:
            "You log off with it unfinished, and it gnaws at you on the walk home. Tomorrow you'll spend twenty minutes rebuilding the context you had right now. Sustainable, though.",
        },
      ],
    },
  ],
  sources: [
    {
      title:
        "A Realistic Day in the Life of a Software Engineer (The Coding Diaries, Medium)",
      url: "https://medium.com/the-coding-diaries/a-realistic-day-in-the-life-of-a-software-engineer-2a0f17b92836",
      grounds:
        "Coding is a minority of the day; Jira tickets, PR review, meetings; the YouTube glamour gap.",
    },
    {
      title: "Code is invisible -software progress is hard to assess (Quora)",
      url: "https://www.quora.com/If-youre-a-software-engineer-does-that-mean-you-will-not-have-life-and-travel-you-will-sit-the-whole-day-coding",
      grounds:
        "Invisible progress; 'first 90% / last 10%'; 'moving protocol buffers around' mundanity.",
    },
    {
      title:
        "What is day-to-day life like as a software engineer? (CareerVillage)",
      url: "https://www.careervillage.org/questions/532870/what-is-a-day-to-day-life-like-as-a-software-engineer",
      grounds:
        "Standup ritual, clearing blockers, design/code review, meetings to sync requirements.",
    },
    {
      title: "Day in the Life of a Software Engineer, Unfiltered (ProResumes)",
      url: "https://proresumes.io/day-in-the-life-of-a-software-engineer/",
      grounds:
        "On-call, async across time zones, the gap between glossy vlogs and the real workday.",
    },
  ],
};
