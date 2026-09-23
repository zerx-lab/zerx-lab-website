import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildSnapshot, parseModelLinks, parseReleases, syncLiveBench } from "./sync-livebench.mjs";

const constants = 'export const RELEASES = ["2025-01-01", "2026-06-25"];';
const metadata = `export const modelLinks = {
  alpha: { organization: "Org", displayName: "Alpha", openweight: true, variants: [{ rawName: "alpha-fast", displayName: "Alpha Fast", openweight: false }] },
  beta: { organization: "Other", displayName: "Beta" },
  tuned: { organization: "Tuner", finetune: { baseKey: "alpha" } },
  "tuned-name": { organization: "Tuner", finetune: { baseModel: "Alpha Fast", baseOrganization: "Org" } },
  "tuned-orphan": { organization: "Tuner", finetune: { baseKey: "missing", baseModel: "Unknown" } },
  "grok-3": { organization: "xAI" }
};`;
const csv = "model,r1,r2,code,if\nalpha,100,0,80,\nalpha-fast,70,70,90,80\nbeta,90,90,20,\ntuned,100,100,100,100\ntuned-name,70,70,70,70\ntuned-orphan,60,60,60,60\nunknown,100,100,100,100\ngrok-3,10,10,10,10\n";
const categoriesJson = JSON.stringify({ Reasoning: ["r1", "r2"], Coding: ["code"], IF: ["if"] });
const sha = (char) => char.repeat(40);
const tree = [
  ["src/lib/constants.js", sha("a"), constants],
  ["src/Table/modelLinks.js", sha("b"), metadata],
  ["public/table_2026_06_25.csv", sha("c"), csv],
  ["public/categories_2026_06_25.json", sha("d"), categoriesJson],
];
const fixtures = (entries = tree, commit = sha("e")) => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, headers: options.headers });
    if (url.endsWith("/commits/main")) {
      if (options.headers["If-None-Match"] === '"etag"') return new Response(null, { status: 304, headers: { "x-poll-interval": "60" } });
      return Response.json({ sha: commit, commit: { tree: { sha: sha("f") } } }, { headers: { etag: '"etag"', "x-poll-interval": "60" } });
    }
    if (url.includes("/git/trees/")) return Response.json({ tree: entries.map(([path, entrySha]) => ({ path, sha: entrySha, type: "blob" })) });
    const item = entries.find(([, entrySha]) => url.endsWith(`/git/blobs/${entrySha}`));
    if (item) return Response.json({ encoding: "base64", content: Buffer.from(item[2]).toString("base64") });
    throw new Error(`Unexpected URL ${url}`);
  };
  return { fetchImpl, calls };
};

function sample() {
  return buildSnapshot({ csv, categoriesJson, metadataJs: metadata, release: "2026-06-25", sourceSha: sha("e"), sourceFingerprint: "fingerprint", syncedAt: "2026-09-23T00:00:00.000Z" });
}

test("static parsing rejects executable upstream syntax, even nested in model metadata", () => {
  assert.equal(parseReleases(constants), "2026-06-25");
  assert.throws(() => parseReleases('export const RELEASES = [process.exit(1)];'), /Unsupported upstream JavaScript syntax/);
  assert.throws(() => parseModelLinks('export const modelLinks = { a: { organization: (() => process.exit(1))() } };'), /Unsupported upstream JavaScript syntax/);
});

test("variant metadata inherits absent values but honors explicit false", () => {
  const links = parseModelLinks('export const modelLinks = { a: { organization: "Org", displayName: "A", openweight: true, variants: [{ rawName: "inherit", displayName: null, openweight: null }, { rawName: "closed", openweight: false }] } };');
  assert.equal(links.get("inherit").displayName, "A");
  assert.equal(links.get("inherit").openweight, true);
  assert.equal(links.get("closed").openweight, false);
});

test("snapshot retains metadata-matched variants, finetunes and raw task scores", () => {
  const data = sample();
  assert.equal(data.schemaVersion, 2);
  assert.deepEqual(data.categories, [
    { id: "Reasoning", name: "Reasoning", subtasks: ["r1", "r2"] },
    { id: "Coding", name: "Coding", subtasks: ["code"] },
    { id: "IF", name: "IF", subtasks: ["if"] },
  ]);
  assert.deepEqual(data.models.map((model) => model.id), ["tuned", "alpha-fast", "tuned-name", "alpha", "tuned-orphan", "grok-3", "beta"]);
  const byId = Object.fromEntries(data.models.map((model) => [model.id, model]));
  assert.equal(byId.alpha.openWeights, true);
  assert.equal(byId["alpha-fast"].openWeights, false); // variant overrides inherited metadata
  assert.equal(byId.alpha.variantGroup, "alpha");
  assert.equal(byId["alpha-fast"].variantGroup, "alpha");
  assert.equal(byId.tuned.finetune, true);
  assert.equal(byId.tuned.baseId, "alpha");
  assert.equal(byId["tuned-name"].baseId, "alpha-fast");
  assert.equal(byId["tuned-orphan"].baseId, null);
  assert.equal(byId.alpha.finetune, false);
  assert.equal(byId.alpha.baseId, null);
  assert.equal(byId.beta.overall, 55);
  assert.equal(byId.beta.scores.IF, null);
  assert.equal(byId.beta.subtasks.if, null);
  assert.deepEqual({ ...byId.alpha.subtasks }, { r1: 100, r2: 0, code: 80, if: null });
  assert.equal(byId["grok-3"].overall, 58); // upstream's explicit Grok adjustment
  assert.throws(() => buildSnapshot({ csv: csv.replace("alpha-fast,70", "alpha-fast,wat"), categoriesJson, metadataJs: metadata }), /Invalid score/);
  assert.throws(() => buildSnapshot({ csv: csv.replace("model,r1,r2", "model,r1,r1"), categoriesJson, metadataJs: metadata }), /Invalid LiveBench columns/);
});

test("category scores retain unrounded means for selected-category ranking", () => {
  const data = buildSnapshot({
    csv: "model,a,b,c\nalpha,1,2,2\n",
    categoriesJson: JSON.stringify({ Reasoning: ["a", "b", "c"] }),
    metadataJs: metadata,
  });
  assert.equal(data.models[0].scores.Reasoning, 5 / 3);
  assert.equal(data.models[0].overall, 1.67);
});

test("conditional 304, restored-cache mismatch, and polling delay preserve committed snapshot", async () => {
  const dir = await mkdtemp(join(tmpdir(), "livebench-sync-"));
  try {
    const dataPath = join(dir, "data.json");
    const statePath = join(dir, "state.json");
    const network = fixtures();
    const options = { ...network, dataPath, statePath, now: () => 1_000_000, token: "secret" };
    const first = await syncLiveBench(options);
    assert.deepEqual([first.changed, first.requests, first.models], [true, 6, 7]);
    assert.equal(network.calls[0].headers.Authorization, "Bearer secret");
    const saved = await readFile(dataPath, "utf8");
    assert.deepEqual(await syncLiveBench(options), { changed: false, requests: 0 });
    assert.equal(await readFile(dataPath, "utf8"), saved);
    const later = { ...options, now: () => 1_100_000 };
    assert.deepEqual(await syncLiveBench(later), { changed: false, requests: 1 });
    assert.equal(network.calls.at(-1).headers["If-None-Match"], '"etag"');
    assert.equal(await readFile(dataPath, "utf8"), saved);
    const unrelatedCommit = {
      ...later,
      now: () => 1_300_000,
      fetchImpl: (url, opts) => url.endsWith("/commits/main")
        ? Response.json({ sha: sha("1"), commit: { tree: { sha: sha("f") } } }, { headers: { "x-poll-interval": "60" } })
        : network.fetchImpl(url, opts),
    };
    assert.deepEqual(await syncLiveBench(unrelatedCommit), { changed: false, requests: 2 });
    assert.equal(await readFile(dataPath, "utf8"), saved);

    // Actions can restore a newer state cache alongside an older committed JSON.
    const older = JSON.parse(saved);
    older.sourceFingerprint = "older-committed-file";
    await writeFile(dataPath, JSON.stringify(older));
    await assert.rejects(syncLiveBench({ ...later, now: () => 1_300_000 }), /polling paused/);
    const recovered = await syncLiveBench({ ...later, now: () => 1_400_000 });
    assert.equal(recovered.changed, true);
    assert.equal(recovered.requests, 5); // 304 + tree + three content blobs; constants SHA is cached.
    const regenerated = JSON.parse(await readFile(dataPath, "utf8"));
    assert.equal(regenerated.sourceFingerprint, JSON.parse(saved).sourceFingerprint);
    assert.equal(regenerated.syncedAt, new Date(1_400_000).toISOString());
    // Schema migration must also wait for the upstream polling window.
    const legacy = { ...regenerated, sourceFingerprint: "legacy-v1-fingerprint" };
    delete legacy.schemaVersion;
    await writeFile(dataPath, JSON.stringify(legacy));
    await assert.rejects(syncLiveBench({ ...later, now: () => 1_400_000 }), /polling paused/);
    const migrated = await syncLiveBench({ ...later, now: () => 1_500_000 });
    assert.deepEqual([migrated.changed, migrated.requests, migrated.models], [true, 5, 7]);
    assert.equal(JSON.parse(await readFile(dataPath, "utf8")).schemaVersion, 2);
    assert.deepEqual(await syncLiveBench({ ...later, now: () => 1_500_000 }), { changed: false, requests: 0 });
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("rate limit persists Retry-After/reset and failure never overwrites data", async () => {
  const dir = await mkdtemp(join(tmpdir(), "livebench-limit-"));
  try {
    const dataPath = join(dir, "data.json");
    const statePath = join(dir, "state.json");
    await writeFile(dataPath, '{"committed":true}\n');
    let count = 0;
    const options = {
      dataPath, statePath, now: () => 1_000_000,
      fetchImpl: async () => {
        count++;
        return new Response("rate limit", { status: 403, headers: { "retry-after": "120", "x-ratelimit-reset": "1500" } });
      },
    };
    await assert.rejects(syncLiveBench(options), /retry after/);
    assert.equal((await JSON.parse(await readFile(statePath, "utf8"))).notBefore, 1_501_000);
    await assert.rejects(syncLiveBench(options), /rate limited until/);
    assert.equal(count, 1);
    await assert.rejects(syncLiveBench({ ...options, now: () => 1_502_000 }), /retry after/);
    await assert.rejects(syncLiveBench({ ...options, now: () => 1_900_000 }), /rate limited until/);
    assert.equal(count, 2);
    assert.equal(await readFile(dataPath, "utf8"), '{"committed":true}\n');
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("non-limited upstream errors retain the old snapshot and do not set backoff", async () => {
  const dir = await mkdtemp(join(tmpdir(), "livebench-error-"));
  try {
    const dataPath = join(dir, "data.json");
    const statePath = join(dir, "state.json");
    await writeFile(dataPath, '{"committed":true}\n');
    const options = { dataPath, statePath, fetchImpl: async () => new Response("bad gateway", { status: 502 }) };
    await assert.rejects(syncLiveBench(options), /GitHub API 502/);
    assert.equal((await JSON.parse(await readFile(statePath, "utf8"))).notBefore, undefined);
    assert.equal(await readFile(dataPath, "utf8"), '{"committed":true}\n');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
