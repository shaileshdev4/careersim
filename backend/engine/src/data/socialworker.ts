import { Career } from "../types";

// =============================================================================
// SOCIAL WORKER (child & family services)
// Grounded from: NASW practice standards, case-management day accounts,
// secondary-trauma literature. Felt texture: relational, bureaucratic,
// morally heavy - paperwork vs. the person in front of you.
// =============================================================================

export const socialworker: Career = {
  id: "socialworker",
  title: "Social Worker",
  realityLine:
    "It's not saving everyone. It's twelve open cases, a parent who didn't show, a form due at five, and knowing one phone call could change a kid's week.",
  mood: {
    accent: "#7dd4a8",
    bgFrom: "#081410",
    bgTo: "#102018",
    texture: "weighted",
    tempo: 0.55,
  },
  dayStart: 8 * 60 + 30,
  dayEndApprox: 18 * 60,
  meters: [
    {
      id: "caseload",
      label: "Caseload",
      hint: "How current you are on open cases.",
      start: 45,
    },
    {
      id: "trust",
      label: "Client Trust",
      hint: "Families believe you'll show up.",
      start: 55,
    },
    {
      id: "reserve",
      label: "Reserve",
      hint: "Emotional bandwidth left for the work.",
      start: 65,
    },
  ],
  tensions: [
    {
      id: "systems",
      label: "The person vs. The system",
      poleA: "The person",
      poleB: "The system",
      description:
        "A human crisis meets a form, a deadline, and a supervisor's metrics.",
    },
    {
      id: "boundaries",
      label: "Show up vs. Protect yourself",
      poleA: "Show up",
      poleB: "Protect yourself",
      description: "The need is bottomless; you cannot pour from an empty cup.",
    },
    {
      id: "risk",
      label: "Act now vs. Document first",
      poleA: "Act now",
      poleB: "Document first",
      description:
        "Safety decisions with incomplete information and real liability.",
    },
  ],
  openingBeatId: "sw_morning",
  beats: [
    {
      id: "sw_morning",
      clockAnchor: 518,
      phase: "morning",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "8:38 AM. Your inbox has overnight alerts: a missed visit, a school concern about the Martinez family, and a supervisor note - 'close two cases this month.' You have four home visits today and a court report due Thursday.",
      artifacts: [
        {
          id: "inbox",
          title: "Case alerts",
          body: "Martinez: school flagged attendance drop\nLee: missed visit yesterday - reschedule?\nSupervisor: 'need movement on closings'",
        },
        {
          id: "schedule",
          title: "Today's route",
          body: "4 home visits · 45 min drive between #2 and #3\nCourt report draft: 0% · due Thu",
        },
      ],
      pressure: {
        label: "First visit leaves in",
        deadlineSeconds: 55,
        defaultChoiceId: "sw_am_route",
      },
      rank: {
        items: [
          {
            id: "martinez",
            label: "Martinez family - school flag",
            detail: "Kid's attendance dropped. Urgent or noisy?",
          },
          {
            id: "lee",
            label: "Lee - missed visit follow-up",
            detail: "Trust erodes fast when you don't show.",
          },
          {
            id: "paperwork",
            label: "Court report outline",
            detail: "Boring. Load-bearing.",
          },
        ],
        topItemToChoiceId: {
          martinez: "sw_am_martinez",
          lee: "sw_am_lee",
          paperwork: "sw_am_paper",
        },
      },
      choices: [
        {
          id: "sw_am_martinez",
          label:
            "Call the Martinez school first - understand before you drive.",
          delta: {
            advanceMinutes: 30,
            energy: -6,
            meters: { trust: +10, caseload: +8 },
            tensionId: "systems",
            pole: "A",
          },
          consequence:
            "The counselor says the kid's been caring for a sibling. Context changes the visit. You started with the person, not the file.",
        },
        {
          id: "sw_am_lee",
          label: "Text Lee's guardian - apologize and lock a new time today.",
          delta: {
            advanceMinutes: 20,
            energy: -4,
            meters: { trust: +12, caseload: +5 },
            tensionId: "boundaries",
            pole: "A",
          },
          consequence:
            "They reply 'thank you for trying.' Small words, big deposit. Martinez waits.",
        },
        {
          id: "sw_am_paper",
          label:
            "Block 45 minutes for the court report skeleton - deadline is real.",
          delta: {
            advanceMinutes: 45,
            energy: -8,
            meters: { caseload: +14, trust: -4 },
            tensionId: "systems",
            pole: "B",
          },
          consequence:
            "Outline done. The system is satisfied. Your first visit starts late and the family notices.",
        },
        {
          id: "sw_am_route",
          label: "Stick to the route - you'll learn what you learn in person.",
          delta: {
            advanceMinutes: 15,
            energy: -5,
            meters: { caseload: +6 },
            tensionId: "risk",
            pole: "A",
          },
          consequence:
            "You're in the car on time. You're also walking into Martinez cold. Sometimes motion beats preparation.",
        },
      ],
    },
    {
      id: "sw_morning_d2",
      clockAnchor: 518,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "8:38 AM. Day two. Yesterday's Martinez visit opened something - the parent mentioned substance use 'off the record.' Your supervisor wants it documented. The parent hasn't returned your call.",
      artifacts: [
        {
          id: "inbox",
          title: "Supervisor email",
          body: "'If there's safety concern, document today.'\nMartinez: no callback\nNew intake added to your load",
        },
        {
          id: "schedule",
          title: "Today's route",
          body: "Martinez revisit · 3 other visits\nYou ended yesterday drained",
        },
      ],
      pressure: {
        label: "Supervisor check-in",
        deadlineSeconds: 50,
        defaultChoiceId: "sw_am_route",
      },
      rank: {
        items: [
          {
            id: "martinez",
            label: "Chase Martinez disclosure",
            detail: "Safety vs. trust.",
          },
          {
            id: "lee",
            label: "Keep Lee visit on track",
            detail: "Yesterday's win to protect.",
          },
          {
            id: "paperwork",
            label: "Document concern formally",
            detail: "Cover yourself and the kid.",
          },
        ],
        topItemToChoiceId: {
          martinez: "sw_am_martinez",
          lee: "sw_am_lee",
          paperwork: "sw_am_paper",
        },
      },
      choices: [
        {
          id: "sw_am_martinez",
          label:
            "Drive to Martinez unannounced - gentle, but you need eyes on.",
          delta: {
            advanceMinutes: 35,
            energy: -10,
            meters: { trust: -6, caseload: +12 },
            tensionId: "risk",
            pole: "A",
          },
          consequence:
            "Door opens on the second knock. Parent is hungover but kids are fed. You see enough to act - and enough to worry about the relationship.",
        },
        {
          id: "sw_am_lee",
          label: "Honor Lee visit first - reliability buys honesty later.",
          delta: {
            advanceMinutes: 25,
            energy: -5,
            meters: { trust: +10, reserve: +4 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "Lee visit goes well. Martinez disclosure sits in your chest until afternoon.",
        },
        {
          id: "sw_am_paper",
          label:
            "File the safety note now - let legal and supervisor weigh in.",
          delta: {
            advanceMinutes: 40,
            energy: -8,
            meters: { caseload: +15, trust: -8 },
            tensionId: "systems",
            pole: "B",
          },
          consequence:
            "Paper trail started. Parent will feel betrayed when they find out. You chose the system over the relationship.",
        },
        {
          id: "sw_am_route",
          label: "Call supervisor for guidance before you move.",
          delta: {
            advanceMinutes: 22,
            energy: -4,
            meters: { caseload: +8, reserve: +6 },
            tensionId: "risk",
            pole: "B",
          },
          consequence:
            "Supervisor says 'document and visit.' You have a plan. Day two and you're already negotiating liability.",
        },
      ],
    },
    {
      id: "sw_morning_d3",
      clockAnchor: 518,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "8:38 AM. Day three. Court Thursday. Martinez is escalated. Your supervisor offers to take a case if you admit you're underwater. Pride vs. survival.",
      artifacts: [
        {
          id: "inbox",
          title: "Court prep",
          body: "Martinez report must be filed tonight\nSupervisor: 'say the word if you need relief'\nLee family sent a thank-you card",
        },
        {
          id: "schedule",
          title: "Week tally",
          body: "3 days of hard calls · reserve low\nOne win (Lee) · one minefield (Martinez)",
        },
      ],
      pressure: {
        label: "Court filing",
        deadlineSeconds: 45,
        defaultChoiceId: "sw_am_paper",
      },
      rank: {
        items: [
          {
            id: "paperwork",
            label: "Finish Martinez court report",
            detail: "Everything rides on accuracy.",
          },
          {
            id: "martinez",
            label: "One more home visit first",
            detail: "Human detail the report needs.",
          },
          {
            id: "lee",
            label: "Ask for case relief",
            detail: "Protect day three.",
          },
        ],
        topItemToChoiceId: {
          paperwork: "sw_am_paper",
          martinez: "sw_am_martinez",
          lee: "sw_am_lee",
        },
      },
      choices: [
        {
          id: "sw_am_paper",
          label: "Clear the morning for the report - lock the door, write.",
          delta: {
            advanceMinutes: 50,
            energy: -10,
            meters: { caseload: +18, reserve: -8 },
            tensionId: "systems",
            pole: "B",
          },
          consequence:
            "Report is tight. You missed a visit slot. The system will be fine; a family will feel forgotten.",
        },
        {
          id: "sw_am_martinez",
          label: "Visit Martinez once more - the report needs their voice.",
          delta: {
            advanceMinutes: 40,
            energy: -12,
            meters: { trust: +8, caseload: +10 },
            tensionId: "systems",
            pole: "A",
          },
          consequence:
            "Parent talks for an hour. The report becomes human. You file at 7pm anyway.",
        },
        {
          id: "sw_am_lee",
          label: "Take supervisor up on relief - hand off one case.",
          delta: {
            advanceMinutes: 30,
            energy: +4,
            meters: { reserve: +14, caseload: -10 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "Load lightens. Admitting limits feels like failure and like wisdom at the same time.",
        },
        {
          id: "sw_am_route",
          label: "Run the route - wing the report tonight.",
          delta: {
            advanceMinutes: 20,
            energy: -8,
            meters: { trust: +6, caseload: +4 },
            tensionId: "risk",
            pole: "A",
          },
          consequence:
            "Day three by momentum. Court tomorrow on fumes and hope.",
        },
      ],
    },
    {
      id: "sw_crisis",
      clockAnchor: 630,
      phase: "morning",
      scene:
        "10:30 AM. Between visits, a text from an unknown number: 'He's not safe at home.' No name. Your gut says you know which file. Protocol says verify before you react.",
      choices: [
        {
          id: "sw_cr_act",
          label:
            "Call the number immediately - safety doesn't wait for office hours.",
          delta: {
            advanceMinutes: 35,
            energy: -12,
            meters: { trust: +10, reserve: -10 },
            tensionId: "risk",
            pole: "A",
          },
          consequence:
            "It's Martinez's neighbor. You initiate a welfare check. Right call - and your nervous system pays retail.",
        },
        {
          id: "sw_cr_protocol",
          label:
            "Run the number through the system, alert supervisor, follow protocol.",
          delta: {
            advanceMinutes: 25,
            energy: -6,
            meters: { caseload: +10, reserve: -4 },
            tensionId: "risk",
            pole: "B",
          },
          consequence:
            "Protocol works. Response is slower than your instinct wanted. Nobody can say you jumped the gun.",
        },
      ],
      eligibleWhen: (s) =>
        ["sw_morning", "sw_morning_d2", "sw_morning_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "sw_notes",
      clockAnchor: 840,
      phase: "afternoon",
      scene:
        "2:00 PM. Back at the office. Three visits need notes before end of day or they 'didn't happen' for billing. A colleague wants to vent about their caseload. Your eyes are gritty.",
      choices: [
        {
          id: "sw_no_grind",
          label: "Notes first - close the loop while memory is fresh.",
          delta: {
            advanceMinutes: 50,
            energy: -10,
            meters: { caseload: +15, reserve: -8 },
            tensionId: "systems",
            pole: "B",
          },
          consequence:
            "Notes are clean. Supervisor off your back. You skipped the colleague's vent and they'll remember.",
        },
        {
          id: "sw_no_human",
          label:
            "Twenty minutes with your colleague - secondary trauma shared.",
          delta: {
            advanceMinutes: 35,
            energy: -4,
            meters: { reserve: +10, caseload: -6 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "You both exhale. Notes slip to tomorrow. The work is relational even when the system pretends it isn't.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("sw_crisis"),
    },
    {
      id: "sw_close",
      clockAnchor: 1020,
      phase: "evening",
      scene:
        "5:00 PM. The office empties. Your court report tab is still open. A Martinez voicemail plays - angry, scared, human. Tomorrow the judge reads what you write tonight.",
      isFinale: true,
      choices: [
        {
          id: "sw_cl_stay",
          label: "Stay until the report is right - and return the voicemail.",
          delta: {
            advanceMinutes: 45,
            energy: -14,
            meters: { caseload: +12, trust: +8 },
            tensionId: "boundaries",
            pole: "A",
          },
          consequence:
            "You leave at 6:30 with both done. The job took your evening again. The kid might be safer for it.",
        },
        {
          id: "sw_cl_bound",
          label: "File a solid draft, go home, call Martinez in the morning.",
          delta: {
            advanceMinutes: 20,
            energy: +6,
            meters: { reserve: +12, trust: -4 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "You're present for dinner. The voicemail waits. Protecting yourself is also a skill this job requires.",
        },
      ],
    },
  ],
  sources: [
    {
      title: "NASW Standards for Social Work Case Management",
      url: "https://www.socialworkers.org/",
      grounds: "Caseload pressure, documentation requirements, home visits.",
    },
    {
      title: "Secondary Trauma in Social Work (NASW)",
      url: "https://www.socialworkers.org/News/Research-Data/Social-Work-Policy-Research",
      grounds: "Emotional labor, boundaries, supervisor support.",
    },
    {
      title: "A Day in the Life of a Child Welfare Social Worker",
      url: "https://www.childwelfare.gov/",
      grounds: "Safety assessments, court reports, family trust.",
    },
  ],
};
