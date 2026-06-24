/** Local ambient photos (from frontend/scripts/fetch-career-photos.mjs). */
export const CAREER_AMBIENT: Record<string, string> = {
  surgeon: "/careers/surgeon-ambient.jpg",
  engineer: "/careers/engineer-ambient.jpg",
  teacher: "/careers/teacher-ambient.jpg",
  analyst: "/careers/analyst-ambient.jpg",
  nurse: "/careers/nurse-ambient.jpg",
  journalist: "/careers/journalist-ambient.jpg",
  socialworker: "/careers/socialworker-ambient.jpg",
  uxdesigner: "/careers/uxdesigner-ambient.jpg",
};

export function careerAmbientUrl(
  careerId: string | null | undefined,
): string | null {
  if (!careerId) return null;
  return CAREER_AMBIENT[careerId] ?? null;
}
