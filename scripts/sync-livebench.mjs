import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseJs } from "acorn";
import { parse as parseCsv } from "csv-parse/sync";

const API = "https://api.github.com/repos/LiveBench/new-livebench";
const SOURCE = "https://github.com/LiveBench/new-livebench";
const SCHEMA_VERSION = 2;
const SOURCE_FILES = ["src/lib/constants.js", "src/Table/modelLinks.js"];
const DEFAULT_DATA = resolve("src/content/data/livebench.json");
const DEFAULT_STATE = resolve(".cache/livebench-state.json");

function declaration(source, name) {
  const ast = parseJs(source, { ecmaVersion: "latest", sourceType: "module" });
  for (const item of ast.body) {
    const statement = item.type === "ExportNamedDeclaration" ? item.declaration : item;
    if (statement?.type !== "VariableDeclaration") continue;
    for (const variable of statement.declarations) {
      if (variable.id.type === "Identifier" && variable.id.name === name) return variable.init;
    }
  }
  throw new Error(`Upstream declaration ${name} not found`);
}

// Parse data syntax only. Imported upstream JavaScript is never evaluated or loaded as a module.
function literal(node) {
  if (node?.type === "Literal" && (node.value === null || ["string", "number", "boolean"].includes(typeof node.value))) return node.value;
  if (node?.type === "ArrayExpression") {
    if (node.elements.some((entry) => !entry || entry.type === "SpreadElement")) throw new Error("Unsupported upstream array syntax");
    return node.elements.map(literal);
  }
  if (node?.type === "ObjectExpression") {
    const result = Object.create(null);
    for (const property of node.properties) {
      if (property.type !== "Property" || property.computed || property.method || property.shorthand || property.kind !== "init") {
        throw new Error("Unsupported upstream object syntax");
      }
      const key = property.key.type === "Identifier" ? property.key.name : literal(property.key);
      if (typeof key !== "string" && typeof key !== "number") throw new Error("Invalid upstream object key");
      if (Object.hasOwn(result, key)) throw new Error(`Duplicate upstream object key: ${key}`);
      result[key] = literal(property.value);
    }
    return result;
  }
  throw new Error(`Unsupported upstream JavaScript syntax: ${node?.type ?? "missing"}`);
}

export function parseReleases(source) {
  const releases = literal(declaration(source, "RELEASES"));
  if (!Array.isArray(releases) || !releases.length || releases.some((date) => typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    throw new Error("Invalid upstream releases");
  }
  return releases.at(-1);
}

export function parseModelLinks(source) {
  const links = literal(declaration(source, "modelLinks"));
  if (!links || Array.isArray(links) || typeof links !== "object") throw new Error("Invalid upstream model metadata");
  const models = new Map();
  for (const [id, info] of Object.entries(links)) {
    if (!info || typeof info !== "object" || Array.isArray(info)) throw new Error(`Invalid metadata for ${id}`);
    models.set(id, { ...info, baseName: id });
    if (!info.variants) continue;
    if (!Array.isArray(info.variants)) throw new Error(`Invalid variants for ${id}`);
    for (const variant of info.variants) {
      if (!variant || typeof variant.rawName !== "string" || models.has(variant.rawName)) throw new Error(`Invalid variant for ${id}`);
      models.set(variant.rawName, { ...info, ...variant, displayName: variant.displayName ?? info.displayName, openweight: variant.openweight ?? info.openweight, baseName: id });
    }
  }
  return models;
}

function average(values) {
  const valid = values.filter((value) => value !== null);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export function buildSnapshot({ csv, categoriesJson, metadataJs, release, sourceSha, sourceFingerprint, syncedAt }) {
  const categories = JSON.parse(categoriesJson);
  if (!categories || typeof categories !== "object" || Array.isArray(categories) || !Object.keys(categories).length) throw new Error("Invalid categories");
  const categoryEntries = Object.entries(categories);
  let headers;
  const rows = parseCsv(csv, {
    columns: (columns) => {
      headers = columns;
      if (!columns.includes("model") || new Set(columns).size !== columns.length) throw new Error("Invalid LiveBench columns");
      return columns;
    },
    skip_empty_lines: true, bom: true, relax_column_count: false,
  });
  if (!rows.length) throw new Error("Empty LiveBench table");
  for (const [category, columns] of categoryEntries) {
    if (!Array.isArray(columns) || !columns.length || columns.some((col) => typeof col !== "string" || !headers.includes(col))) {
      throw new Error(`Invalid LiveBench category ${category}`);
    }
  }
  const metadata = parseModelLinks(metadataJs);
  const seen = new Set();
  const models = [];
  for (const row of rows) {
    const id = row.model;
    if (!id || seen.has(id)) throw new Error(`Missing or duplicate LiveBench model: ${id}`);
    seen.add(id);
    const info = metadata.get(id);
    // Match the upstream table: only rows with model metadata and an overall score.
    if (!info) continue;
    if (typeof info.organization !== "string" || !info.organization) throw new Error(`Missing organization for ${id}`);
    const scores = Object.create(null);
    const subtasks = Object.create(null);
    const rawAverages = [];
    for (const [category, columns] of categoryEntries) {
      const values = columns.map((col) => {
        const raw = row[col];
        if (raw === "") { subtasks[col] = null; return null; }
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`Invalid score ${id}/${col}: ${raw}`);
        subtasks[col] = value;
        return value;
      });
      const score = average(values);
      scores[category] = score;
      rawAverages.push(score);
    }
    const total = id === "grok-3-thinking" ? 72 : id === "grok-3" ? 58 : average(rawAverages);
    if (total === null) continue;
    models.push({
      id, name: info.displayName ?? id, organization: info.organization,
      overall: Number(total.toFixed(2)), scores, subtasks,
      openWeights: !!info.openweight, finetune: !!info.finetune, baseId: null,
      variantGroup: info.baseName,
    });
  }
  // An explicit base key wins, otherwise upstream matches display name and optional organization.
  const byId = new Set(models.map((model) => model.id));
  for (const model of models) {
    if (!model.finetune) continue;
    const finetune = metadata.get(model.id).finetune;
    model.baseId = (finetune.baseKey && byId.has(finetune.baseKey) ? finetune.baseKey : null)
      ?? models.find((candidate) => candidate.name === finetune.baseModel
        && (!finetune.baseOrganization || candidate.organization === finetune.baseOrganization))?.id
      ?? null;
  }
  models.sort((a, b) => b.overall - a.overall || a.id.localeCompare(b.id, "en"));
  if (!models.length) throw new Error("No displayable LiveBench models");
  return {
    schemaVersion: SCHEMA_VERSION, sourceSha, sourceFingerprint, syncedAt, release,
    sourceUrl: SOURCE, unofficial: true,
    categories: categoryEntries.map(([id, subtasks]) => ({ id, name: id, subtasks })),
    models,
  };
}

async function readJson(path) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

async function atomicJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

function retryTime(response, now) {
  const retry = response.headers.get("retry-after");
  const delay = retry && /^\d+$/.test(retry) ? now + Number(retry) * 1000 : Date.parse(retry ?? "");
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  const resetMs = reset > 0 ? reset * 1000 : 0;
  return Math.max(now + 300_000, Number.isFinite(delay) ? delay : 0, resetMs) + 1000;
}

export async function syncLiveBench({ fetchImpl = fetch, now = () => Date.now(), dataPath = DEFAULT_DATA, statePath = DEFAULT_STATE, token = process.env.GITHUB_TOKEN } = {}) {
  const state = (await readJson(statePath)) ?? {};
  const snapshot = await readJson(dataPath);
  if (state.notBefore && now() < state.notBefore) throw new Error(`GitHub rate limited until ${new Date(state.notBefore).toISOString()}`);
  if (state.pollNotBefore && now() < state.pollNotBefore) {
    // A cached fingerprint is meaningful only when the committed snapshot agrees.
    if (snapshot?.schemaVersion === SCHEMA_VERSION && snapshot.sourceFingerprint === state.fingerprint) return { changed: false, requests: 0 };
    throw new Error(`GitHub polling paused until ${new Date(state.pollNotBefore).toISOString()}`);
  }
  let requests = 0;
  async function request(path, { conditional = false } = {}) {
    const headers = {
      Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ZerxLab-LiveBench-Sync",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(conditional && state.etag ? { "If-None-Match": state.etag } : {}),
    };
    const response = await fetchImpl(`${API}${path}`, { headers });
    requests++;
    const poll = Number(response.headers.get("x-poll-interval"));
    if (Number.isFinite(poll) && poll > 0) state.pollNotBefore = Math.max(state.pollNotBefore ?? 0, now() + poll * 1000);
    if (response.status === 403 || response.status === 429) {
      // 403 also covers permissions errors; only defer when GitHub identifies a rate limit.
      const limited = response.status === 429 || response.headers.get("retry-after") || response.headers.get("x-ratelimit-remaining") === "0" || /rate limit/i.test(await response.clone().text());
      if (limited) { state.rateFailures = (state.rateFailures ?? 0) + 1; state.notBefore = Math.max(retryTime(response, now()), now() + Math.min(86_400_000, 300_000 * 2 ** Math.min(state.rateFailures - 1, 9))); }
      throw new Error(`GitHub API ${response.status} at ${path}${limited ? `; retry after ${new Date(state.notBefore).toISOString()}` : ""}`);
    }
    if (response.status !== 304 && !response.ok) throw new Error(`GitHub API ${response.status} at ${path}`);
    return response;
  }
  try {
    const commitResponse = await request("/commits/main", { conditional: true });
    if (commitResponse.headers.get("etag")) state.etag = commitResponse.headers.get("etag");
    let sha;
    let treeSha;
    if (commitResponse.status === 304) {
      sha = state.observedSha;
      treeSha = state.treeSha;
      if (!sha || !treeSha) throw new Error("GitHub returned 304 without cached commit identity");
    } else {
      const commit = await commitResponse.json();
      sha = commit.sha;
      treeSha = commit.commit?.tree?.sha;
      if (!/^[a-f0-9]{40}$/.test(sha ?? "") || !/^[a-f0-9]{40}$/.test(treeSha ?? "")) throw new Error("Invalid GitHub commit response");
      state.observedSha = sha;
      state.treeSha = treeSha;
    }
    if (state.checkedSha === sha && snapshot?.schemaVersion === SCHEMA_VERSION && snapshot.sourceFingerprint === state.fingerprint) return { changed: false, requests };
    const treeResponse = await request(`/git/trees/${treeSha}?recursive=1`);
    const tree = await treeResponse.json();
    if (tree.truncated || !Array.isArray(tree.tree)) throw new Error("Incomplete GitHub tree");
    const entries = new Map(tree.tree.filter((entry) => entry.type === "blob").map((entry) => [entry.path, entry.sha]));
    const constantsSha = entries.get(SOURCE_FILES[0]);
    const metadataSha = entries.get(SOURCE_FILES[1]);
    if (!constantsSha || !metadataSha) throw new Error("LiveBench source files missing from tree");
    // Release metadata only needs fetching when its blob changes.
    const release = state.constantsSha === constantsSha && state.release
      ? state.release
      : parseReleases(await blob(constantsSha));
    const suffix = release.replaceAll("-", "_");
    const csvSha = entries.get(`public/table_${suffix}.csv`);
    const categoriesSha = entries.get(`public/categories_${suffix}.json`);
    if (!csvSha || !categoriesSha) throw new Error(`Missing data files for ${release}`);
    const fingerprint = createHash("sha256").update(JSON.stringify([SCHEMA_VERSION, release, constantsSha, metadataSha, csvSha, categoriesSha])).digest("hex");
    if (snapshot?.schemaVersion === SCHEMA_VERSION && snapshot.sourceFingerprint === fingerprint) {
      state.rateFailures = 0; state.checkedSha = sha;
      state.fingerprint = fingerprint;
      state.constantsSha = constantsSha;
      state.release = release;
      return { changed: false, requests };
    }
    // Keep requests serial: GitHub secondary limits are sensitive to concurrency.
    const metadataJs = await blob(metadataSha);
    const csv = await blob(csvSha);
    const categoriesJson = await blob(categoriesSha);
    const next = buildSnapshot({ csv, categoriesJson, metadataJs, release, sourceSha: sha, sourceFingerprint: fingerprint, syncedAt: new Date(now()).toISOString() });
    await atomicJson(dataPath, next);
    state.rateFailures = 0; state.checkedSha = sha;
    state.fingerprint = fingerprint;
    state.constantsSha = constantsSha;
    state.release = release;
    return { changed: true, requests, models: next.models.length };
  } finally {
    await atomicJson(statePath, state);
  }

  async function blob(sha) {
    const response = await request(`/git/blobs/${sha}`);
    const payload = await response.json();
    if (payload.encoding !== "base64" || typeof payload.content !== "string") throw new Error(`Invalid GitHub blob ${sha}`);
    return Buffer.from(payload.content.replace(/\s/g, ""), "base64").toString("utf8");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const result = await syncLiveBench();
    if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `changed=${result.changed}\n`, { flag: "a" });
    console.log(`LiveBench: changed=${result.changed}, requests=${result.requests}${result.models ? `, models=${result.models}` : ""}`);
  } catch (error) {
    console.error(`LiveBench sync failed: ${error.message}`);
    process.exitCode = 1;
  }
}
