import { Career } from "../types";

// =============================================================================
// ELEMENTARY TEACHER
// Grounded from: Today's Parent "day in the life of an elementary teacher",
// EdWeek "most exhausting part isn't the students", Edutopia emotional-labor
// piece, Frontiers in Psychology emotional-labor sampling study.
// Felt texture: frantic, relational, performative. The reality: hundreds of
// decisions a day, constantly "on," 20-minute lunch with no privacy, can't
// even use the bathroom, suppressing/faking emotion ~1/3 of the time, the
// "I'm telling!" interruption every single day, near-zero time autonomy.
// =============================================================================

export const teacher: Career = {
  id: "teacher",
  title: "Elementary Teacher",
  realityLine:
    "Twenty-five small humans, hundreds of decisions an hour, a twenty-minute lunch you can't escape, and the constant performance of being calm when you are not.",
  mood: {
    accent: "#f0a962", // warm amber
    bgFrom: "#1a1206",
    bgTo: "#2a1d08",
    texture: "frantic",
    tempo: 0.9,
  },
  dayStart: 7 * 60,
  dayEndApprox: 16 * 60 + 30,
  meters: [
    {
      id: "room",
      label: "The Room",
      hint: "Classroom calm. It can flip in seconds.",
      start: 60,
    },
    {
      id: "reserve",
      label: "Reserve",
      hint: "Your emotional battery for staying patient.",
      start: 70,
    },
    {
      id: "behind",
      label: "Caught Up",
      hint: "Lessons, grading, forms -always slipping.",
      start: 50,
    },
  ],
  tensions: [
    {
      id: "emotion",
      label: "Authenticity vs. Performance",
      poleA: "Authenticity",
      poleB: "Performance",
      description:
        "You feel one thing and must show another; the day is a constant emotional performance.",
    },
    {
      id: "fairness",
      label: "The one vs. The many",
      poleA: "The one",
      poleB: "The many",
      description:
        "One child needs you right now and twenty-four others are waiting; you choose, constantly.",
    },
    {
      id: "boundaries",
      label: "Give everything vs. Protect yourself",
      poleA: "Give everything",
      poleB: "Protect yourself",
      description:
        "The work is bottomless; pour yourself in, or guard a little so you survive to Friday.",
    },
  ],
  openingBeatId: "t_arrival",
  beats: [
    {
      id: "t_arrival",
      clockAnchor: 424,
      phase: "dawn",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "7:04 AM. You're at school an hour before the bell because there are a million little things -tidy the room, set out books, reply to colleague emails, assign helper jobs. Your own kid cried at daycare drop-off twenty minutes ago and it's still sitting in your chest.",
      artifacts: [
        {
          id: "prep",
          title: "Morning prep list",
          body: "□ Math manipulatives out\n□ Field-trip forms sorted\n□ Reply to principal re: fire drill\n□ Helper jobs chart - not done\nBell: 8:30 · 26 min",
        },
        {
          id: "email",
          title: "Colleague email",
          body: "From Ms. Rivera: 'Can you cover my recess duty Friday? I owe you one.'\nSent 6:48am. You haven't opened it.",
        },
      ],
      rank: {
        items: [
          {
            id: "prep",
            label: "Finish the prep list first",
            detail: "Room ready = calmer first hour. You won't sit down.",
          },
          {
            id: "breathe",
            label: "Take five minutes for yourself",
            detail: "Coffee, breathe, process daycare. Prep will be partial.",
          },
        ],
        topItemToChoiceId: {
          prep: "t_arr_prep",
          breathe: "t_arr_breathe",
        },
      },
      choices: [
        {
          id: "t_arr_prep",
          label: "Power through the prep list so the day runs smoothly.",
          delta: {
            advanceMinutes: 45,
            energy: -10,
            meters: { behind: +15, reserve: -5 },
            tensionId: "boundaries",
            pole: "A",
          },
          consequence:
            "The room is ready and the first hour will be calmer for it. You didn't sit down once. The daycare feeling is still there, unprocessed.",
        },
        {
          id: "t_arr_breathe",
          label: "Take five real minutes with coffee before the storm.",
          delta: {
            advanceMinutes: 15,
            energy: +6,
            meters: { reserve: +10, behind: -8 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "Five minutes of being a person, not a teacher. The prep's not fully done -you'll improvise -but your battery has something in it now.",
        },
      ],
    },
    {
      id: "t_arrival_d2",
      clockAnchor: 424,
      phase: "dawn",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "7:04 AM. Day two. You left at 5 yesterday and still owe Ms. Rivera a reply about recess duty. The field trip is tomorrow and twelve permission slips are missing. Your voice is already hoarse from yesterday's parent conversation at the door.",
      artifacts: [
        {
          id: "prep",
          title: "Morning prep list",
          body: "□ Chase 12 missing permission slips\n□ Re-seat chart - yesterday's meltdown changed dynamics\n□ Rivera email STILL unread\nBell: 8:30 · 26 min",
        },
        {
          id: "email",
          title: "Principal email",
          body: "Subject: Fire drill follow-up\n'Need your class roster updated by 8am.'\nSent 6:52am while you were still driving.",
        },
      ],
      rank: {
        items: [
          {
            id: "prep",
            label: "Chase slips and fix the seating chart",
            detail: "Tomorrow's trip depends on it. No time to breathe.",
          },
          {
            id: "breathe",
            label: "Five minutes - you're running on empty",
            detail: "The room will be chaotic. You might survive anyway.",
          },
        ],
        topItemToChoiceId: {
          prep: "t_arr_prep",
          breathe: "t_arr_breathe",
        },
      },
      choices: [
        {
          id: "t_arr_prep",
          label: "Power through - slips, roster, seating. No margin for error.",
          delta: {
            advanceMinutes: 45,
            energy: -14,
            meters: { behind: +18, reserve: -8 },
            tensionId: "boundaries",
            pole: "A",
          },
          consequence:
            "The slips are mostly sorted and the chart is done. You're already depleted before the bell - day two doesn't forgive yesterday's late night.",
        },
        {
          id: "t_arr_breathe",
          label: "Sit in your car five more minutes. You need it.",
          delta: {
            advanceMinutes: 18,
            energy: +8,
            meters: { reserve: +12, behind: -12 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "You walk in steadier. The roster isn't updated and the principal will notice. Sometimes protecting yourself costs paperwork.",
        },
      ],
    },
    {
      id: "t_arrival_d3",
      clockAnchor: 424,
      phase: "dawn",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "7:04 AM. Day three - field trip day. You're running on the fumes of a week that started with a crying kid at daycare and never let up. The bus leaves at 9:15 and you still need meds forms for two students. Friday should feel lighter. It doesn't.",
      artifacts: [
        {
          id: "prep",
          title: "Trip checklist",
          body: "□ Bus 9:15 · 2 meds forms missing\n□ Partner teacher called in sick - you're solo\n□ One child flagged 'may not handle trip well'",
        },
        {
          id: "email",
          title: "Parent text (6:41am)",
          body: "'Can you keep an extra eye on Marcus today? Rough week at home.'\nYou haven't replied.",
        },
      ],
      rank: {
        items: [
          {
            id: "prep",
            label: "Trip logistics first - bus won't wait",
            detail: "Forms, groups, backup plan. Everything else slides.",
          },
          {
            id: "breathe",
            label: "Call the parent back before the chaos",
            detail:
              "Marcus needs you to know someone's coming. Slips can wait.",
          },
        ],
        topItemToChoiceId: {
          prep: "t_arr_prep",
          breathe: "t_arr_breathe",
        },
      },
      choices: [
        {
          id: "t_arr_prep",
          label: "Trip mode - forms, groups, contingency plan. Solo today.",
          delta: {
            advanceMinutes: 50,
            energy: -12,
            meters: { behind: +15, room: +8 },
            tensionId: "fairness",
            pole: "B",
          },
          consequence:
            "The bus will have what it needs. Marcus's parent text sits unanswered. You chose the twenty-five over the one - again.",
        },
        {
          id: "t_arr_breathe",
          label: "Call Marcus's mom now. Trip prep will be tight.",
          delta: {
            advanceMinutes: 22,
            energy: -4,
            meters: { reserve: +8, behind: -10 },
            tensionId: "fairness",
            pole: "A",
          },
          consequence:
            "She cries with relief on the phone. You're scrambling on forms but Marcus walks in calmer. The one mattered this morning.",
        },
      ],
    },
    {
      id: "t_belltime",
      clockAnchor: 510,
      phase: "morning",
      scene:
        "8:30 AM. The bell rings and 25 kids pour in. A parent corners you at the door asking how their child is 'really doing' -while you're taking attendance, collecting field-trip money, and herding everyone for announcements. It is not a private setting and you have no notes in hand.",
      pressure: {
        label: "Parent waiting",
        deadlineSeconds: 45,
        defaultChoiceId: "t_bell_engage",
      },
      artifacts: [
        {
          id: "attendance",
          title: "Attendance sheet",
          body: "3 absent · 2 late slips · field-trip money: 11/25 collected\nAnnouncements start in 4 min · parent still at door",
        },
      ],
      choices: [
        {
          id: "t_bell_redirect",
          label:
            "Warmly redirect: 'Let's set up a call -I want to do this properly.'",
          delta: {
            advanceMinutes: 20,
            energy: -5,
            meters: { room: +5, reserve: +3 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "You protect the moment and the child's privacy. The parent's a little disappointed but you've modeled a boundary. The room stayed under control.",
        },
        {
          id: "t_bell_engage",
          label: "Try to answer on the spot while managing the room.",
          delta: {
            advanceMinutes: 25,
            energy: -12,
            meters: { room: -12, reserve: -8 },
            tensionId: "fairness",
            pole: "A",
          },
          consequence:
            "You give the parent a half-answer while attendance slips and two kids start a side-quest by the cubbies. Splitting yourself served no one fully.",
        },
      ],
      eligibleWhen: (s) =>
        ["t_arrival", "t_arrival_d2", "t_arrival_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "t_meltdown",
      clockAnchor: 620,
      phase: "morning",
      scene:
        "10:20 AM. Mid-math, a child bursts into tears -someone 'stole' a pencil crayon. It happens every single day. Twenty-four other kids look up from their work, the lesson hanging in the air. Inside, you're tired. Outside, you must be the calmest person in the room.",
      choices: [
        {
          id: "t_melt_kneel",
          label: "Kneel down, calm voice, handle the one child fully.",
          delta: {
            advanceMinutes: 15,
            energy: -9,
            meters: { reserve: -10, room: -5 },
            tensionId: "fairness",
            pole: "A",
          },
          consequence:
            "The crying stops; that child feels seen. The other 24 drifted off-task and you'll spend energy reeling them back. You faked calm you didn't feel -the day's real labor.",
        },
        {
          id: "t_melt_redirect",
          label:
            "Quick fairness ruling, redirect the whole class back to math fast.",
          delta: {
            advanceMinutes: 8,
            energy: -6,
            meters: { room: +8, reserve: -6 },
            tensionId: "fairness",
            pole: "B",
          },
          consequence:
            "The lesson survives and the room holds. The one child sniffles, not fully soothed. You served the many; the cost is a small ache about the one.",
        },
        {
          id: "t_melt_mask",
          label: "Let the mask slip a half-inch -gentle but visibly tired.",
          delta: {
            advanceMinutes: 12,
            energy: +4,
            meters: { reserve: +8, room: -4 },
            tensionId: "emotion",
            pole: "A",
          },
          consequence:
            "You stop performing perfect patience for one moment. It costs a little control but you didn't spend battery faking. Suppressing emotion all day is what actually burns teachers out.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("t_belltime"),
    },
    {
      id: "t_lunch",
      clockAnchor: 725,
      phase: "midday",
      scene:
        "12:05 PM. Lunch -twenty minutes, and you're ravenous. The only place to eat is the staff room, where the forced chit-chat awaits. The introvert in you just wants silence. You also still haven't been to the bathroom since 7 AM.",
      choices: [
        {
          id: "t_lunch_hide",
          label: "Eat alone in your classroom in blessed silence.",
          delta: {
            advanceMinutes: 20,
            energy: +10,
            meters: { reserve: +12, behind: -5 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "Twenty minutes of nobody needing anything from you. You come back to the afternoon with a real reserve. You skipped the staff-room politics -there's a faint cost there.",
        },
        {
          id: "t_lunch_grade",
          label:
            "Eat at your desk while grading to claw back the 'behind' pile.",
          delta: {
            advanceMinutes: 20,
            energy: -4,
            meters: { behind: +14, reserve: -8 },
            tensionId: "boundaries",
            pole: "A",
          },
          consequence:
            "You make a dent in the grading. You also didn't actually rest, and the afternoon will find you running closer to empty. The work is bottomless; you keep feeding it your breaks.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("t_belltime"),
    },
    {
      id: "t_dismissal",
      clockAnchor: 925,
      phase: "afternoon",
      scene:
        "3:25 PM. Dismissal. Twenty-five jackets that can't be zipped, three kids whose rides are late, a parent email already lighting up your phone about today's 'incident.' Then the room empties and the sudden silence is almost loud.",
      isFinale: true,
      choices: [
        {
          id: "t_dis_stay",
          label: "Stay late to plan tomorrow properly and answer the parent.",
          delta: {
            advanceMinutes: 45,
            energy: -14,
            meters: { behind: +18, reserve: -10 },
            tensionId: "boundaries",
            pole: "A",
          },
          consequence:
            "By 5 PM tomorrow is planned and the parent is handled. You gave the job your evening too. Many days look exactly like this; it's why the profession runs on people who 'care too deeply not to.'",
        },
        {
          id: "t_dis_leave",
          label:
            "Leave the planning for tomorrow morning and go be with your own kids.",
          delta: {
            advanceMinutes: 20,
            energy: +8,
            meters: { reserve: +12, behind: -10 },
            tensionId: "boundaries",
            pole: "B",
          },
          consequence:
            "You're home for dinner and present for your daughter who cried this morning. Tomorrow you'll improvise the first hour. Protecting your peace without numbing your heart -the hardest skill in the job.",
        },
      ],
    },
  ],
  sources: [
    {
      title: "A day in the life of an elementary teacher (Today's Parent)",
      url: "https://www.todaysparent.com/family/a-day-in-the-life-of-an-elementary-teacher/",
      grounds:
        "Hour-early arrival, door-side parent questions, can't use the bathroom, the daily 'I'm telling!', staff-room lunch.",
    },
    {
      title: "The Most Exhausting Part of Teaching Isn't the Students (EdWeek)",
      url: "https://www.edweek.org/teaching-learning/opinion-the-most-exhausting-part-of-teaching-isnt-the-students/2026/01",
      grounds:
        "Emotional labor of being 'everything,' late-night planning, 'care too deeply not to.'",
    },
    {
      title: "The Emotional Labor of Teaching (Edutopia)",
      url: "https://www.edutopia.org/article/teaching-your-heart-out-emotional-labor-and-need-systemic-change",
      grounds:
        "25 kids each bringing emotions; responding with 'calm and consistent tone' regardless of your own state.",
    },
    {
      title:
        "Teachers' emotional experiences and exhaustion (Frontiers in Psychology, 2014)",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4263074/",
      grounds:
        "Teachers suppress or fake emotion in roughly a third of lessons; emotional labor predicts burnout.",
    },
  ],
};
