/**
 * One-time fetch: Pexels → public/careers/{id}-ambient.jpg
 * Run: npm run fetch-photos -w @a-day-in/web
 * Reads PEXELS_API_KEY from apps/web/.env.local or careersim/.env.local
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(__dirname, "..");
const OUT_DIR = join(WEB_ROOT, "public", "careers");

const CAREERS = [
  { id: "surgeon", query: "hospital corridor night medical" },
  { id: "engineer", query: "software developer desk dark office" },
  { id: "teacher", query: "empty classroom chalkboard" },
  { id: "analyst", query: "investment bank office skyline night" },
  { id: "nurse", query: "hospital hallway nurses station" },
  { id: "journalist", query: "newsroom empty desks night" },
  { id: "socialworker", query: "community center office counseling" },
  { id: "uxdesigner", query: "ux design studio whiteboard" },
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(join(WEB_ROOT, ".env.local"));
loadEnvFile(join(WEB_ROOT, "..", "..", "careersim", "careersim", ".env.local"));
loadEnvFile(join(WEB_ROOT, "..", "..", "ghost-crew", ".env"));

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error("Missing PEXELS_API_KEY in apps/web/.env.local");
  process.exit(1);
}

async function searchPhoto(query) {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "5");
  url.searchParams.set("size", "large");

  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const photo = data.photos?.[0];
  if (!photo) throw new Error(`No results for: ${query}`);
  return photo;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = {};

  for (const { id, query } of CAREERS) {
    process.stdout.write(`Fetching ${id}… `);
    const photo = await searchPhoto(query);
    const src = photo.src.large2x || photo.src.large || photo.src.original;
    const buf = await download(src);
    const outPath = join(OUT_DIR, `${id}-ambient.jpg`);
    writeFileSync(outPath, buf);
    manifest[id] = {
      file: `/careers/${id}-ambient.jpg`,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      pexelsUrl: photo.url,
      query,
    };
    console.log(`✓ ${photo.photographer}`);
    await new Promise((r) => setTimeout(r, 400));
  }

  writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log("\nDone - 8 images + manifest.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
