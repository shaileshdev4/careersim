import { Career } from "../types";
import { surgeon } from "./surgeon";
import { engineer } from "./engineer";
import { teacher } from "./teacher";
import { analyst } from "./analyst";
import { nurse } from "./nurse";
import { journalist } from "./journalist";
import { socialworker } from "./socialworker";
import { uxdesigner } from "./uxdesigner";

export const CAREERS: Record<string, Career> = {
  surgeon,
  engineer,
  teacher,
  analyst,
  nurse,
  journalist,
  socialworker,
  uxdesigner,
};

export const CAREER_LIST: Career[] = Object.values(CAREERS);

export function getCareer(id: string): Career | undefined {
  return CAREERS[id];
}
