/* eslint-disable no-console */
import { Beat } from "../types";
import { CAREERS } from "../data";
import { getBeat, initState } from "../scenario";
import {
  validateResponse,
  fallbackDramatization,
  buildRequest,
  buildUserPrompt,
} from "../generate";
import { dramatizeBeat, Transport } from "../dramatize";

let passed = 0,
  failed = 0;
function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}
const tests: Array<{ name: string; run: () => Promise<void> | void }> = [];
const test = (name: string, run: () => Promise<void> | void) =>
  tests.push({ name, run });

const career = CAREERS["surgeon"];
const beat = getBeat(career, "s_rounds")! as Beat;
const ids = beat.choices.map((c) => c.id);

// A well-formed model response that respects the contract.
const goodJson = JSON.stringify({
  scene:
    "5:02 AM. The list is fourteen names long and one is spiking a fever. Rounds in twenty.",
  choices: Object.fromEntries(
    ids.map((id) => [id, `Rewritten label for ${id}`]),
  ),
});

test("Valid model output passes validation and is marked source=model", () => {
  const r = validateResponse(goodJson, beat);
  check(r.ok, "should accept well-formed output");
  check(r.dramatized?.source === "model", "should mark model source");
  check(
    Object.keys(r.dramatized!.choiceLabels).length === ids.length,
    "should map all labels",
  );
});

test("Rejects output that ADDS a choice id", () => {
  const bad = JSON.stringify({
    scene: "ok scene here long enough",
    choices: {
      ...Object.fromEntries(ids.map((id) => [id, "x"])),
      s_injected: "free pizza",
    },
  });
  check(!validateResponse(bad, beat).ok, "extra id must be rejected");
});

test("Rejects output that DROPS a choice id", () => {
  const bad = JSON.stringify({
    scene: "ok scene here long enough",
    choices: Object.fromEntries(ids.slice(1).map((id) => [id, "x"])),
  });
  check(!validateResponse(bad, beat).ok, "missing id must be rejected");
});

test("Rejects non-JSON / prose output", () => {
  check(
    !validateResponse("Sure! Here's your scene...", beat).ok,
    "prose must be rejected",
  );
});

test("Rejects empty or too-short scene", () => {
  const bad = JSON.stringify({
    scene: "hi",
    choices: Object.fromEntries(ids.map((id) => [id, "x"])),
  });
  check(!validateResponse(bad, beat).ok, "short scene must be rejected");
});

test("Rejects over-long scene (runaway generation)", () => {
  const bad = JSON.stringify({
    scene: "word ".repeat(200),
    choices: Object.fromEntries(ids.map((id) => [id, "x"])),
  });
  check(!validateResponse(bad, beat).ok, "long scene must be rejected");
});

test("Rejects a label that is not a string", () => {
  const bad = JSON.stringify({
    scene: "ok scene here long enough",
    choices: Object.fromEntries(ids.map((id, i) => [id, i === 0 ? 123 : "x"])),
  });
  check(!validateResponse(bad, beat).ok, "non-string label must be rejected");
});

test("Strips markdown code fences before parsing", () => {
  const fenced = "```json\n" + goodJson + "\n```";
  check(validateResponse(fenced, beat).ok, "fenced JSON should still validate");
});

test("Fallback preserves exact engine structure", () => {
  const fb = fallbackDramatization(beat);
  check(fb.source === "fallback", "fallback marked");
  check(fb.scene === beat.scene, "fallback scene is authored scene");
  for (const c of beat.choices)
    check(fb.choiceLabels[c.id] === c.label, `fallback label for ${c.id}`);
});

// ---Orchestrator behavior with injected transports ---

test("dramatizeBeat returns model output when transport returns valid JSON", async () => {
  const t: Transport = async () => goodJson;
  const out = await dramatizeBeat(career, beat, initState(career), {
    transport: t,
  });
  check(out.source === "model", "should use model output");
});

test("dramatizeBeat falls back when transport returns garbage", async () => {
  const t: Transport = async () => "lol no";
  const out = await dramatizeBeat(career, beat, initState(career), {
    transport: t,
  });
  check(out.source === "fallback", "should fall back on invalid output");
  check(out.scene === beat.scene, "fallback content correct");
});

test("dramatizeBeat falls back when transport throws", async () => {
  const t: Transport = async () => {
    throw new Error("network down");
  };
  const out = await dramatizeBeat(career, beat, initState(career), {
    transport: t,
  });
  check(out.source === "fallback", "should fall back on throw");
});

test("dramatizeBeat falls back on timeout (slow transport)", async () => {
  const t: Transport = ({ signal }) =>
    new Promise((resolve, reject) => {
      const id = setTimeout(() => resolve(goodJson), 500);
      signal?.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new Error("aborted"));
      });
    });
  const start = Date.now();
  const out = await dramatizeBeat(career, beat, initState(career), {
    transport: t,
    timeoutMs: 50,
  });
  const elapsed = Date.now() - start;
  check(out.source === "fallback", "slow call should fall back");
  check(elapsed < 400, `should abort fast, took ${elapsed}ms`);
});

test("dramatizeBeat falls back when disabled or no transport (engine-only mode)", async () => {
  const a = await dramatizeBeat(career, beat, initState(career), {});
  const b = await dramatizeBeat(career, beat, initState(career), {
    transport: async () => goodJson,
    enabled: false,
  });
  check(
    a.source === "fallback" && b.source === "fallback",
    "no-transport and disabled both fall back",
  );
});

test("Prompt construction is grounded and never leaks deltas to the model", () => {
  const req = buildRequest(career, beat, initState(career));
  const user = buildUserPrompt(req);
  check(req.grounding.length >= 3, "request carries grounded material");
  check(/id "s_rounds_fast"/.test(user), "user prompt pins exact choice ids");
  // The prompt must NOT contain numeric state deltas (energy/meter math).
  check(
    !/energy:\s*-?\d/.test(user) && !/advanceMinutes/.test(user),
    "prompt must not leak engine math to the model",
  );
});

(async () => {
  console.log("\n=== CAREER SIM -GENERATION CONTRACT HARNESS ===\n");
  for (const t of tests) {
    try {
      await t.run();
      passed++;
      console.log(`  ✓ ${t.name}`);
    } catch (e) {
      failed++;
      console.log(`  ✗ ${t.name}`);
      console.log(`      ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  console.log(`\n---${passed} passed, ${failed} failed ---\n`);
  if (failed > 0) process.exit(1);
})();
