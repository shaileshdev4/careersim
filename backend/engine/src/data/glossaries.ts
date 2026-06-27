import { GlossaryTerm } from "../types";

/** Beat glossaries keyed as `careerId:beatId`. */
export const BEAT_GLOSSARIES: Record<string, GlossaryTerm[]> = {
  "surgeon:s_rounds": [
    {
      term: "rounds",
      anchor_text: "Rounds",
      fallback:
        "Morning rounds are when the surgical team visits every patient and discusses care with the attending.",
    },
    {
      term: "chief",
      anchor_text: "chief",
      fallback:
        "The chief is the senior surgeon who leads the team and expects everyone to be prepared.",
    },
    {
      term: "charts",
      anchor_text: "chart",
      fallback:
        "A chart is the patient's medical record - labs, notes, and orders you'd review before seeing them.",
    },
    {
      term: "post-op",
      anchor_text: "post-op",
      fallback:
        "Post-op means after surgery - these patients need wound checks and monitoring for complications.",
    },
    {
      term: "febrile",
      anchor_text: "febrile",
      fallback:
        "Febrile means feverish - a warning sign after surgery that the team can't ignore.",
    },
  ],
  "surgeon:s_rounds_d2": [
    {
      term: "signout",
      anchor_text: "signout",
      fallback:
        "Signout is the handoff when the overnight team passes patient updates to the morning team.",
    },
    {
      term: "rounds",
      anchor_text: "Rounds",
      fallback:
        "Morning rounds are when the surgical team visits every patient with the attending.",
    },
  ],
  "engineer:e_standup": [
    {
      term: "standup",
      anchor_text: "standup",
      fallback:
        "A standup is a short daily meeting where engineers say what they're working on and what's blocking them.",
    },
    {
      term: "subsystem",
      anchor_text: "subsystem",
      fallback:
        "A subsystem is one part of the codebase - often owned by a specific team or engineer.",
    },
  ],
  "teacher:t_arrival": [
    {
      term: "prep list",
      anchor_text: "prep list",
      fallback:
        "The prep list is everything a teacher needs ready before students arrive - copies, materials, seating.",
    },
  ],
  "analyst:a_open": [
    {
      term: "comps",
      anchor_text: "comps",
      fallback:
        "Comps are comparable-company analyses - spreadsheets that value a deal against similar companies.",
    },
    {
      term: "circulate",
      anchor_text: "circulate",
      fallback:
        "To circulate a deck is to send the presentation for review before it goes to the client or MD.",
    },
  ],
  "nurse:n_board": [
    {
      term: "tracking board",
      anchor_text: "tracking board",
      fallback:
        "The ED tracking board shows every patient in the department, their status, and who is waiting for a bed.",
    },
  ],
  "journalist:j_morning": [
    {
      term: "lede",
      anchor_text: "lede",
      fallback:
        "The lede is the opening line of a story - it has to hook the reader in one sentence.",
    },
  ],
  "socialworker:sw_morning": [
    {
      term: "intake",
      anchor_text: "intake",
      fallback:
        "Intake is the first meeting where you learn a client's situation and decide what services they need.",
    },
  ],
  "uxdesigner:ux_kickoff": [
    {
      term: "crit",
      anchor_text: "crit",
      fallback:
        "A design crit is a structured review where the team gives feedback on work in progress.",
    },
  ],
};
