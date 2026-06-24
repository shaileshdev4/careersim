import { Career } from "../types";

// =============================================================================
// ER NURSE
// Grounded from: ANA nursing workforce reports, ER nurse day-in-life accounts,
// emergency nursing triage literature. Felt texture: urgent, bodily, moral
// weight without surgeon's hierarchy - you are the front line before the doctor.
// =============================================================================

export const nurse: Career = {
  id: "nurse",
  title: "ER Nurse",
  realityLine:
    "It's not Grey's Anatomy. It's twelve patients waiting, one crashing, meds due on four, and you're the one who actually sees them first.",
  mood: {
    accent: "#e85d75",
    bgFrom: "#1a080c",
    bgTo: "#2a1018",
    texture: "urgent",
    tempo: 0.85,
  },
  dayStart: 6 * 60 + 30,
  dayEndApprox: 19 * 60,
  meters: [
    {
      id: "flow",
      label: "Patient Flow",
      hint: "Board moving - or backing up.",
      start: 55,
    },
    {
      id: "composure",
      label: "Composure",
      hint: "Steady hands when everything hits at once.",
      start: 65,
    },
    {
      id: "team",
      label: "Team Trust",
      hint: "Charge nurse and docs rely on your reads.",
      start: 50,
    },
  ],
  tensions: [
    {
      id: "triage",
      label: "Speed vs. Thoroughness",
      poleA: "Speed",
      poleB: "Thoroughness",
      description:
        "The waiting room is full; do you move fast or catch what rushing misses?",
    },
    {
      id: "advocacy",
      label: "Speak up vs. Defer",
      poleA: "Speak up",
      poleB: "Defer",
      description:
        "You see the patient before the doctor - when do you push back on the plan?",
    },
    {
      id: "stamina",
      label: "Push through vs. Protect yourself",
      poleA: "Push through",
      poleB: "Protect yourself",
      description: "Twelve hours on your feet; the board never really clears.",
    },
  ],
  openingBeatId: "n_board",
  beats: [
    {
      id: "n_board",
      clockAnchor: 395,
      phase: "dawn",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "6:35 AM. Shift change. The board shows eleven in the waiting room, two in triage, one chest pain still waiting on labs. Your charge nurse is already looking at you like you should know which fire to grab first.",
      artifacts: [
        {
          id: "board",
          title: "ED tracking board",
          body: "WAITING: 11 · TRIAGE: 2 · ROOM 4: chest pain, labs pending\nRm 7: febrile kid · Rm 9: laceration, sutures ready\nLast nurse signed out: 'don't lose track of chest pain'",
        },
        {
          id: "handoff",
          title: "Charge handoff",
          body: "Short-staffed - one tech called out\nDoc running behind on admits\nMeds due on 4 patients before 7:30",
        },
      ],
      pressure: {
        label: "Morning rush in",
        deadlineSeconds: 50,
        defaultChoiceId: "n_board_fast",
      },
      rank: {
        items: [
          {
            id: "chest",
            label: "Chest pain - labs pending",
            detail: "Could be nothing. Could be the thing.",
          },
          {
            id: "febrile",
            label: "Febrile pediatric patient",
            detail: "Parent anxious. Waiting 40 min.",
          },
          {
            id: "meds",
            label: "Four med passes due",
            detail: "Miss a window and it's on you.",
          },
        ],
        topItemToChoiceId: {
          chest: "n_board_chest",
          febrile: "n_board_febrile",
          meds: "n_board_meds",
        },
      },
      choices: [
        {
          id: "n_board_chest",
          label:
            "Pull chest pain first - check vitals, chase labs, flag the doc.",
          delta: {
            advanceMinutes: 25,
            energy: -10,
            meters: { flow: +10, team: +8 },
            tensionId: "triage",
            pole: "B",
          },
          consequence:
            "Labs are back before the doc rounds - troponin negative, but you caught a BP trend they would've missed. Thoroughness on the scary one.",
        },
        {
          id: "n_board_febrile",
          label: "Triage the febrile kid - the waiting room is getting loud.",
          delta: {
            advanceMinutes: 20,
            energy: -8,
            meters: { flow: +12, composure: +5 },
            tensionId: "advocacy",
            pole: "A",
          },
          consequence:
            "Parent exhales when you call the name. The chest pain waits another twenty minutes - you made a call with incomplete information.",
        },
        {
          id: "n_board_meds",
          label:
            "Clear the med pass first - four patients, zero tolerance for late.",
          delta: {
            advanceMinutes: 30,
            energy: -12,
            meters: { team: +10, flow: +5 },
            tensionId: "stamina",
            pole: "A",
          },
          consequence:
            "Every med on time. The board didn't move and the charge nurse noticed you played it safe. Sometimes safe is slow.",
        },
        {
          id: "n_board_fast",
          label: "Eyeball the board, grab the loudest problem, keep moving.",
          delta: {
            advanceMinutes: 15,
            energy: -6,
            meters: { flow: +8, composure: -5 },
            tensionId: "triage",
            pole: "A",
          },
          consequence:
            "You stayed ahead of the rush for an hour. Something small got skipped - you'll find out which by mid-shift.",
        },
      ],
    },
    {
      id: "n_board_d2",
      clockAnchor: 395,
      phase: "dawn",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "6:35 AM. Day two. Yesterday's board never really emptied - you dreamt in beeping. Same short staffing, plus a flu surge overnight. The charge nurse says 'we're in the red again.'",
      artifacts: [
        {
          id: "board",
          title: "ED tracking board",
          body: "WAITING: 16 · AMBULANCE BAY: 2 inbound\nYesterday's near-miss flagged in handoff notes\nYou ended yesterday depleted",
        },
        {
          id: "handoff",
          title: "Overnight signout",
          body: "Inbound trauma ETA 15 min\nWaiting room agitated - security called twice\nMeds pass still heavy",
        },
      ],
      pressure: {
        label: "Ambulance inbound",
        deadlineSeconds: 45,
        defaultChoiceId: "n_board_fast",
      },
      rank: {
        items: [
          {
            id: "chest",
            label: "Prep trauma bay",
            detail: "Inbound - all hands.",
          },
          {
            id: "febrile",
            label: "Hold the waiting room",
            detail: "16 people, one you.",
          },
          {
            id: "meds",
            label: "Meds due - again",
            detail: "The unglamorous work that keeps people safe.",
          },
        ],
        topItemToChoiceId: {
          chest: "n_board_chest",
          febrile: "n_board_febrile",
          meds: "n_board_meds",
        },
      },
      choices: [
        {
          id: "n_board_chest",
          label: "Trauma bay ready - gloves, lines, notify the doc now.",
          delta: {
            advanceMinutes: 22,
            energy: -14,
            meters: { team: +12, flow: +8 },
            tensionId: "advocacy",
            pole: "A",
          },
          consequence:
            "Inbound rolls in and the room is ready. You're running on yesterday's empty - but the team saw you show up.",
        },
        {
          id: "n_board_febrile",
          label:
            "Triage the waiting room surge - triage is the pressure valve.",
          delta: {
            advanceMinutes: 25,
            energy: -10,
            meters: { flow: +14, composure: -6 },
            tensionId: "triage",
            pole: "A",
          },
          consequence:
            "You kept the lobby from boiling over. Trauma bay was thirty seconds behind - nobody died, everybody felt it.",
        },
        {
          id: "n_board_meds",
          label:
            "Meds first. Again. Because that's what actually kills people quietly.",
          delta: {
            advanceMinutes: 28,
            energy: -11,
            meters: { team: +8, composure: +6 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "Quiet wins. The charge nurse remembers who didn't drop the basics when the bay was screaming.",
        },
        {
          id: "n_board_fast",
          label: "React to whatever's loudest - survive the first hour.",
          delta: {
            advanceMinutes: 18,
            energy: -8,
            meters: { flow: +6, composure: -8 },
            tensionId: "triage",
            pole: "A",
          },
          consequence:
            "Hour one survived. Day two and you're already behind the composure you had Monday.",
        },
      ],
    },
    {
      id: "n_board_d3",
      clockAnchor: 395,
      phase: "dawn",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "6:35 AM. Day three. Your feet ache from shifts one and two. The hospital is offering overtime you don't want. A regular patient asks for you by name - the small reward for three hard days.",
      artifacts: [
        {
          id: "board",
          title: "ED tracking board",
          body: "Moderate volume - deceptive calm\nStaff meeting at 7:15 re: new triage protocol\nOT sheet in the break room",
        },
        {
          id: "handoff",
          title: "Charge note",
          body: "'You've carried a lot this week. Don't be a hero today unless you have to.'",
        },
      ],
      pressure: {
        label: "Staff meeting",
        deadlineSeconds: 40,
        defaultChoiceId: "n_board_fast",
      },
      rank: {
        items: [
          {
            id: "chest",
            label: "Study the new triage protocol",
            detail: "Meeting in 40 min.",
          },
          {
            id: "febrile",
            label: "Start the board anyway",
            detail: "Protocol won't wait for patients.",
          },
          {
            id: "meds",
            label: "Ask for a lighter assignment",
            detail: "Protect day three.",
          },
        ],
        topItemToChoiceId: {
          chest: "n_board_chest",
          febrile: "n_board_febrile",
          meds: "n_board_meds",
        },
      },
      choices: [
        {
          id: "n_board_chest",
          label:
            "Read the protocol before the meeting - get ahead of the change.",
          delta: {
            advanceMinutes: 30,
            energy: -6,
            meters: { team: +10, composure: +8 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "You walk into the meeting prepared. It's the first time this week you felt like you were leading, not surviving.",
        },
        {
          id: "n_board_febrile",
          label: "Patients first - you'll learn the protocol on the fly.",
          delta: {
            advanceMinutes: 20,
            energy: -12,
            meters: { flow: +12, team: -4 },
            tensionId: "advocacy",
            pole: "A",
          },
          consequence:
            "The board moved. The meeting started without you and the charge nurse noticed.",
        },
        {
          id: "n_board_meds",
          label: "Tell charge you need a lighter load today.",
          delta: {
            advanceMinutes: 15,
            energy: +4,
            meters: { composure: +12, team: -6 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "They reassign two patients. Pride stings. Your hands are steadier by noon than they've been all week.",
        },
        {
          id: "n_board_fast",
          label: "Default mode - grab the board, keep moving.",
          delta: {
            advanceMinutes: 15,
            energy: -10,
            meters: { flow: +8 },
            tensionId: "triage",
            pole: "A",
          },
          consequence:
            "Day three by muscle memory. You're not sharp - you're functional. There's a difference.",
        },
      ],
    },
    {
      id: "n_family",
      clockAnchor: 540,
      phase: "morning",
      scene:
        "9:00 AM. A patient's family is yelling in the hallway - your patient, your call. The doc is in a procedure. Security is hovering but waiting for you to de-escalate. Twenty other people can hear every word.",
      choices: [
        {
          id: "n_fam_pull",
          label: "Pull them to a quiet room - full attention, no audience.",
          delta: {
            advanceMinutes: 25,
            energy: -10,
            meters: { composure: +10, flow: -5 },
            tensionId: "advocacy",
            pole: "A",
          },
          consequence:
            "They leave calmer. You lost twenty minutes on the board. Emotional labor is the part they don't chart.",
        },
        {
          id: "n_fam_boundary",
          label:
            "Firm boundary: 'I'll answer when the doctor is out. Not here.'",
          delta: {
            advanceMinutes: 10,
            energy: -5,
            meters: { flow: +8, team: +4 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "They don't like it. The hallway stays functional. You protected the many at the cost of the one.",
        },
      ],
      eligibleWhen: (s) =>
        ["n_board", "n_board_d2", "n_board_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "n_crash",
      clockAnchor: 720,
      phase: "midday",
      scene:
        "12:00 PM. A patient codes in the hallway - not yours, but you're closest. The crash cart is ten feet away. Your other patients' meds are due in eight minutes.",
      choices: [
        {
          id: "n_crash_run",
          label: "Run the code - everything else waits.",
          delta: {
            advanceMinutes: 35,
            energy: -18,
            meters: { team: +15, composure: +8, flow: -12 },
            tensionId: "stamina",
            pole: "A",
          },
          consequence:
            "ROSC on the second round. You shake for ten minutes after. The meds were late - you fixed a life and owe paperwork.",
        },
        {
          id: "n_crash_call",
          label:
            "Hit the button, start compressions, yell for the assigned nurse.",
          delta: {
            advanceMinutes: 20,
            energy: -8,
            meters: { team: +6, flow: +5 },
            tensionId: "advocacy",
            pole: "B",
          },
          consequence:
            "The right team assembled in ninety seconds. You kept your patients covered. Leadership means knowing when you're not the whole answer.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("n_family"),
    },
    {
      id: "n_signout",
      clockAnchor: 1080,
      phase: "evening",
      scene:
        "6:00 PM. Sign-out. Your voice is flat and your feet are done. The night nurse wants every detail on the febrile kid, the chest pain, and the family you de-escalated. Tomorrow someone else gets the board.",
      isFinale: true,
      choices: [
        {
          id: "n_out_full",
          label: "Full sign-out - every contingency, every family dynamic.",
          delta: {
            advanceMinutes: 25,
            energy: -8,
            meters: { team: +12, flow: +8 },
            tensionId: "advocacy",
            pole: "A",
          },
          consequence:
            "Night shift nods - they have what they need. You leave twenty minutes late. Patient safety doesn't punch out at six.",
        },
        {
          id: "n_out_short",
          label: "Hit the highlights and go - you're not good for more today.",
          delta: {
            advanceMinutes: 12,
            energy: +4,
            meters: { team: -4, composure: +6 },
            tensionId: "stamina",
            pole: "B",
          },
          consequence:
            "You're in the car by 6:15. At 8:30 the night nurse texts a question you could've prevented. The trade is always there.",
        },
      ],
    },
  ],
  sources: [
    {
      title: "Emergency Nursing Triage (ENA)",
      url: "https://www.ena.org/",
      grounds:
        "Triage prioritization, board management, front-line patient contact.",
    },
    {
      title: "A Day in the Life of an ER Nurse (nursing accounts)",
      url: "https://www.nurse.org/",
      grounds:
        "Shift change handoff, med passes, family conflict, running codes.",
    },
    {
      title: "Emergency Department Nursing Workforce (ANA)",
      url: "https://www.nursingworld.org/practice-policy/workforce/",
      grounds:
        "Short staffing, emotional labor, patient advocacy at the bedside.",
    },
  ],
};
