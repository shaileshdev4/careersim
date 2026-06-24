import { Career } from "../types";

// =============================================================================
// NEWSROOM JOURNALIST
// Grounded from: Poynter day-in-the-life pieces, Reuters trainee accounts,
// press-room deadline culture. Felt texture: adrenaline + ethics, invisible
// legwork, editor power, the story vs. the clock.
// =============================================================================

export const journalist: Career = {
  id: "journalist",
  title: "Newsroom Journalist",
  realityLine:
    "It's not chasing scoops in a trench coat. It's six tabs open, a source who won't call back, and an editor who wants the piece rewritten by six.",
  mood: {
    accent: "#6eb5ff",
    bgFrom: "#0a0e14",
    bgTo: "#121a24",
    texture: "wired",
    tempo: 0.75,
  },
  dayStart: 8 * 60,
  dayEndApprox: 20 * 60,
  meters: [
    {
      id: "story",
      label: "The Story",
      hint: "How solid the reporting actually is.",
      start: 45,
    },
    {
      id: "deadline",
      label: "Deadline",
      hint: "Room before the slot closes.",
      start: 60,
    },
    {
      id: "cred",
      label: "Credibility",
      hint: "Editors and sources trust your calls.",
      start: 55,
    },
  ],
  tensions: [
    {
      id: "ethics",
      label: "Speed vs. Verification",
      poleA: "Speed",
      poleB: "Verification",
      description: "The tweet is already out; do you match it or check it?",
    },
    {
      id: "access",
      label: "Push vs. Protect sources",
      poleA: "Push",
      poleB: "Protect sources",
      description: "Getting the quote can burn the person who trusted you.",
    },
    {
      id: "voice",
      label: "Your angle vs. Editor's frame",
      poleA: "Your angle",
      poleB: "Editor's frame",
      description: "The story you found vs. the headline the desk wants.",
    },
  ],
  openingBeatId: "j_morning",
  beats: [
    {
      id: "j_morning",
      clockAnchor: 488,
      phase: "morning",
      eligibleWhen: (s) => (s.arcDay ?? 1) === 1,
      scene:
        "8:08 AM. The morning meeting just ended and you've been assigned the follow on yesterday's city council vote - plus a possible sidebar on the protest outside. Your editor wants a draft by 2 PM. Your main source hasn't texted back.",
      artifacts: [
        {
          id: "slack",
          title: "#news-desk",
          body: "Editor: 'council vote + protest angle - 800 words by 2'\n8:02 · Colleague: 'I'm on the protest if you want split'\nYour source: read 7:41am, no reply",
        },
        {
          id: "notes",
          title: "Reporting notes",
          body: "Council passed 5-4 - you weren't there\nProtest: 200 people, one arrest (unverified tweet)\nNeed: councillor quote, protest organizer",
        },
      ],
      pressure: {
        label: "Editor check-in",
        deadlineSeconds: 55,
        defaultChoiceId: "j_mo_chase",
      },
      rank: {
        items: [
          {
            id: "verify",
            label: "Verify the arrest story first",
            detail: "Twitter isn't a source. Yet.",
          },
          {
            id: "source",
            label: "Chase the councillor quote",
            detail: "Without it the piece is empty.",
          },
          {
            id: "protest",
            label: "Hit the protest before it disperses",
            detail: "Color the piece or lose it.",
          },
        ],
        topItemToChoiceId: {
          verify: "j_mo_verify",
          source: "j_mo_source",
          protest: "j_mo_chase",
        },
      },
      choices: [
        {
          id: "j_mo_verify",
          label:
            "Call the desk sergeant - verify the arrest before you write a word.",
          delta: {
            advanceMinutes: 35,
            energy: -6,
            meters: { story: +15, cred: +10, deadline: -8 },
            tensionId: "ethics",
            pole: "B",
          },
          consequence:
            "Arrest confirmed - minor charge, not what Twitter implied. You just avoided a correction. The editor doesn't praise you; they just don't yell.",
        },
        {
          id: "j_mo_source",
          label: "Camp on the councillor's voicemail until someone picks up.",
          delta: {
            advanceMinutes: 40,
            energy: -8,
            meters: { story: +12, deadline: -10 },
            tensionId: "access",
            pole: "A",
          },
          consequence:
            "Aide calls back with a bland quote. It's not great journalism - it's publishable journalism, which is the bar today.",
        },
        {
          id: "j_mo_chase",
          label: "Grab your bag and get to the protest before the crowd thins.",
          delta: {
            advanceMinutes: 25,
            energy: -10,
            meters: { story: +8, deadline: +5 },
            tensionId: "ethics",
            pole: "A",
          },
          consequence:
            "You get color and a protester on record. The council vote lede is still thin. The desk will make you fix it at 1 PM.",
        },
      ],
    },
    {
      id: "j_morning_d2",
      clockAnchor: 488,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 2,
      scene:
        "8:08 AM. Day two. Yesterday's piece got traffic but a councillor's office called it 'sloppy.' Your editor forwards the complaint with one word: 'Fix.' New assignment: follow-up plus a profile pitch due by noon.",
      artifacts: [
        {
          id: "slack",
          title: "#news-desk",
          body: "Editor: 'councillor's office unhappy - tighten or we run a correction'\n8:00 · Legal: 'flag anything defamatory'\nSource finally texted: 'can talk at 10'",
        },
        {
          id: "notes",
          title: "Correction risk",
          body: "One paraphrase disputed\nProfile pitch: 3 sentences needed by noon\nYesterday's traffic still climbing",
        },
      ],
      pressure: {
        label: "Legal review",
        deadlineSeconds: 50,
        defaultChoiceId: "j_mo_chase",
      },
      rank: {
        items: [
          {
            id: "verify",
            label: "Rewrite the disputed graf",
            detail: "Correction kills credibility.",
          },
          {
            id: "source",
            label: "Take the source call at 10",
            detail: "First real quote in two days.",
          },
          {
            id: "protest",
            label: "Pitch the profile fast",
            detail: "Noon deadline, no draft.",
          },
        ],
        topItemToChoiceId: {
          verify: "j_mo_verify",
          source: "j_mo_source",
          protest: "j_mo_chase",
        },
      },
      choices: [
        {
          id: "j_mo_verify",
          label: "Rewrite the disputed section - get legal sign-off.",
          delta: {
            advanceMinutes: 45,
            energy: -10,
            meters: { cred: +14, story: +8, deadline: -12 },
            tensionId: "ethics",
            pole: "B",
          },
          consequence:
            "Updated piece goes up clean. The councillor's office goes quiet. You spent the morning fixing instead of advancing.",
        },
        {
          id: "j_mo_source",
          label: "Take the source call - this relationship is the real asset.",
          delta: {
            advanceMinutes: 50,
            energy: -8,
            meters: { story: +15, cred: +8 },
            tensionId: "access",
            pole: "B",
          },
          consequence:
            "Source opens up - background, not for print yet. You have a real story for day three if you protect them.",
        },
        {
          id: "j_mo_chase",
          label:
            "Bang out the profile pitch - worry about the correction after.",
          delta: {
            advanceMinutes: 30,
            energy: -6,
            meters: { deadline: +10, cred: -8 },
            tensionId: "voice",
            pole: "B",
          },
          consequence:
            "Pitch lands. Editor likes it. The disputed graf is still live and legal is still nervous.",
        },
      ],
    },
    {
      id: "j_morning_d3",
      clockAnchor: 488,
      phase: "morning",
      eligibleWhen: (s) => s.arcDay === 3,
      scene:
        "8:08 AM. Day three. The profile got approved - 1,200 words due tomorrow. Your source will go on record if you protect one detail. The editor wants the angle 'harder.' You're tired of harder.",
      artifacts: [
        {
          id: "slack",
          title: "Editor DM",
          body: "'Make the profile bite. We need traffic.'\nSource: 'I'll talk if you don't name my department'\nYesterday's correction scare still in your chest",
        },
        {
          id: "notes",
          title: "Profile outline",
          body: "Strong human story · risky institutional detail\nProtect source vs. satisfy editor - pick one",
        },
      ],
      pressure: {
        label: "Outline due",
        deadlineSeconds: 45,
        defaultChoiceId: "j_mo_chase",
      },
      rank: {
        items: [
          {
            id: "verify",
            label: "Build the outline around verification",
            detail: "Slow, defensible.",
          },
          {
            id: "source",
            label: "Protect the source's condition",
            detail: "Relationship over splash.",
          },
          {
            id: "protest",
            label: "Give the editor the harder angle",
            detail: "Traffic wins arguments.",
          },
        ],
        topItemToChoiceId: {
          verify: "j_mo_verify",
          source: "j_mo_source",
          protest: "j_mo_chase",
        },
      },
      choices: [
        {
          id: "j_mo_verify",
          label:
            "Outline a careful piece - every claim footnoted before you write.",
          delta: {
            advanceMinutes: 40,
            energy: -6,
            meters: { story: +12, cred: +12 },
            tensionId: "ethics",
            pole: "B",
          },
          consequence:
            "Editor sighs but approves. Day three and you're building something that won't boomerang.",
        },
        {
          id: "j_mo_source",
          label:
            "Promise the source anonymity - shape the piece around their trust.",
          delta: {
            advanceMinutes: 35,
            energy: -4,
            meters: { story: +14, cred: +10, deadline: -5 },
            tensionId: "access",
            pole: "B",
          },
          consequence:
            "They agree to a long interview. The story is real. The editor wanted blood; you chose a person.",
        },
        {
          id: "j_mo_chase",
          label: "Pitch the hard angle - give the desk what it's asking for.",
          delta: {
            advanceMinutes: 25,
            energy: -8,
            meters: { deadline: +12, cred: -6 },
            tensionId: "voice",
            pole: "B",
          },
          consequence:
            "Editor grins. You know the source may not pick up again. Traffic and trust rarely share a headline.",
        },
      ],
    },
    {
      id: "j_rewrite",
      clockAnchor: 600,
      phase: "morning",
      scene:
        "10:00 AM. You file a draft. Twenty minutes later the editor's notes land: 'Lede buried. Cut 200 words. Needs a stronger quote. Can you turn by 12?' The story you reported is not the story they want.",
      choices: [
        {
          id: "j_rw_fight",
          label: "Push back - the lede is right, the desk is wrong.",
          delta: {
            advanceMinutes: 30,
            energy: -8,
            meters: { cred: +6, deadline: -10 },
            tensionId: "voice",
            pole: "A",
          },
          consequence:
            "They listen - partly. You keep half your structure. Fights cost political capital you don't have much of.",
        },
        {
          id: "j_rw_rewrite",
          label: "Rewrite it their way. Ship by noon.",
          delta: {
            advanceMinutes: 90,
            energy: -14,
            meters: { deadline: +15, cred: -4, story: -5 },
            tensionId: "voice",
            pole: "B",
          },
          consequence:
            "Piece publishes on time. It's not yours anymore. That's the job more days than not.",
        },
      ],
      eligibleWhen: (s) =>
        ["j_morning", "j_morning_d2", "j_morning_d3"].some((id) =>
          s.visited.includes(id),
        ),
    },
    {
      id: "j_breaking",
      clockAnchor: 780,
      phase: "midday",
      scene:
        "1:00 PM. A push alert: possible fire at the convention center. The desk wants someone there in twenty minutes. Your council piece still needs a final read. Everything is always both.",
      choices: [
        {
          id: "j_br_go",
          label: "Go to the scene - the council piece waits.",
          delta: {
            advanceMinutes: 60,
            energy: -12,
            meters: { story: +12, deadline: -15 },
            tensionId: "ethics",
            pole: "A",
          },
          consequence:
            "You're first on scene with usable detail. The council piece slips to a colleague who doesn't know your sources. Breaking news eats everything.",
        },
        {
          id: "j_br_stay",
          label: "Finish the council piece - someone else can cover the fire.",
          delta: {
            advanceMinutes: 45,
            energy: -6,
            meters: { deadline: +12, cred: +6 },
            tensionId: "voice",
            pole: "A",
          },
          consequence:
            "Your piece lands clean. The fire story wins the homepage. You chose depth on the wrong news day.",
        },
      ],
      eligibleWhen: (s) => s.visited.includes("j_rewrite"),
    },
    {
      id: "j_close",
      clockAnchor: 1080,
      phase: "evening",
      scene:
        "6:00 PM. The piece is live - or the profile is filed for tomorrow. Your editor says 'good enough' which is the newsroom compliment. Your source texts 'thank you for not screwing me.' You stare at the blinking cursor and wonder if that's the whole point.",
      isFinale: true,
      choices: [
        {
          id: "j_cl_plan",
          label:
            "Plan tomorrow's reporting before you leave - stay one step ahead.",
          delta: {
            advanceMinutes: 30,
            energy: -6,
            meters: { story: +10, cred: +6 },
            tensionId: "access",
            pole: "A",
          },
          consequence:
            "Tomorrow's calls are lined up. You leave at 6:45 still wired. The job doesn't end when the story publishes.",
        },
        {
          id: "j_cl_leave",
          label: "Close the laptop. The news will still be there at 8 AM.",
          delta: {
            advanceMinutes: 10,
            energy: +8,
            meters: { cred: -2, deadline: -5 },
            tensionId: "voice",
            pole: "A",
          },
          consequence:
            "You walk out into daylight like a person. Somewhere an editor is already thinking about the morning meeting. You chose your life, briefly.",
        },
      ],
    },
  ],
  sources: [
    {
      title: "A Day in the Life of a Journalist (Poynter)",
      url: "https://www.poynter.org/",
      grounds:
        "Morning meeting, editor rewrites, source relationships, deadline pressure.",
    },
    {
      title: "Reuters Journalism Trainee Programme",
      url: "https://www.reuters.com/",
      grounds:
        "Verification culture, breaking news vs. depth, desk-editor dynamics.",
    },
    {
      title: "The Emotional Toll of Breaking News (Columbia Journalism Review)",
      url: "https://www.cjr.org/",
      grounds:
        "Speed vs. accuracy, source protection, editor pressure on angle.",
    },
  ],
};
