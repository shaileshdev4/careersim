import { Career } from "../types";
import { surgeon } from "./surgeon";
import { engineer } from "./engineer";
import { teacher } from "./teacher";
import { analyst } from "./analyst";
import { nurse } from "./nurse";
import { journalist } from "./journalist";
import { socialworker } from "./socialworker";
import { uxdesigner } from "./uxdesigner";
import { CAREER_MENTORS } from "./mentors";
import { BEAT_GLOSSARIES } from "./glossaries";

const RAW: Record<string, Career> = {
  surgeon,
  engineer,
  teacher,
  analyst,
  nurse,
  journalist,
  socialworker,
  uxdesigner,
};

function enrichCareer(c: Career): Career {
  return {
    ...c,
    mentor: CAREER_MENTORS[c.id],
    beats: c.beats.map((b) => ({
      ...b,
      glossary: b.glossary ?? BEAT_GLOSSARIES[`${c.id}:${b.id}`],
    })),
  };
}

export const CAREERS: Record<string, Career> = Object.fromEntries(
  Object.entries(RAW).map(([id, c]) => [id, enrichCareer(c)]),
);

export const CAREER_LIST: Career[] = Object.values(CAREERS);

export function getCareer(id: string): Career | undefined {
  return CAREERS[id];
}
