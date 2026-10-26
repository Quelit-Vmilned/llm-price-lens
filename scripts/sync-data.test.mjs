import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { syncData, writeSnapshot } from "./sync-data.mjs";

let root, payload, etag, clock, override, licenseText;
const license = "MIT test license\n";
const hash = (text) => createHash("sha256").update(text).digest("hex");
const model = (id) => ({ id, name: id, modalities: { input: ["text"], output: ["text"] }, cost: { input: 1, output: 2 }, limit: { context: 1000 } });
const config = {
  name: "Test", url: "https://example.com/api.json", repository: "https://example.com/repo",
  auditedCommit: "a".repeat(40), license: "MIT", licenseUrl: "https://example.com/LICENSE", licenseSha256: hash(license),
  providers: ["test"], requiredProviders: ["test"], providerAliases: {},
};
const save = (name, value) => writeFile(join(root, "data", name), JSON.stringify(value, null, 2) + "\n");
const bytes = async () => Promise.all(["prices.generated.json", "quality-report.json"].map((name) => readFile(join(root, "data", name), "utf8")));
const fetchImpl = async (url) => {
  if (url === config.licenseUrl) return new Response(licenseText);
  if (override) return override(url);
  return new Response(payload, { headers: { etag } });
};
const run = (options = {}) => syncData({ root, fetchImpl, now: () => clock, ...options });

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "price-lens-sync-"));
  await mkdir(join(root, "data")); await mkdir(join(root, "src"));
  for (const name of ["pipeline.ts", "schema.ts"]) await writeFile(join(root, "src", name), `fixture ${name}`);
  await save("sources.json", config);
  await save("manual-overrides.json", { schemaVersion: 1, models: [] });
  await save("benchmark-snapshot.json", { source: null, metric: null, capturedAt: null, sourceUrl: null, models: [] });
  await save("benchmark-aliases.json", {});
  await save("prices.generated.json", { schemaVersion: 1, generatedAt: "2026-10-20T00:00:00Z", models: [], warnings: [] });
  payload = JSON.stringify({ test: { name: "Test", models: { v1: model("v1"), v2: model("v2"), v3: model("v3"), v4: model("v4") } } });
  licenseText = license; etag = '"v1"'; clock = "2026-10-26T01:00:00Z"; override = null;
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

describe("synchronization over the fetch/normalize/merge/validate/emit boundary", () => {
  it("publishes real responses and updates prices/timestamps only after successful validation", async () => {
    expect((await run()).changed).toBe(true);
    const initial = await bytes();
    const changed = JSON.parse(payload); changed.test.models.v1.cost.input = 7;
    payload = JSON.stringify(changed); etag = '"v2"'; clock = "2026-10-26T01:30:00Z";
    expect((await run()).changed).toBe(true);
    const current = await bytes();
    expect(current).not.toEqual(initial);
    expect(JSON.parse(current[0]).models[0].inputPerMillionUsd).toBe(7);
    expect(JSON.parse(current[0]).generatedAt).toBe(clock);
    expect(JSON.parse(current[1]).sources[0].payloadSha256).toBe(hash(payload));
  });
  it("retains both files byte-for-byte for unchanged 200 and conditional 304 checks", async () => {
    await run(); const before = await bytes();
    expect((await run()).changed).toBe(false);
    let conditional;
    const conditionalFetch = async (url, options) => {
      if (url === config.licenseUrl) return new Response(license);
      conditional = options.headers["If-None-Match"];
      return new Response(null, { status: 304 });
    };
    expect((await run({ fetchImpl: conditionalFetch })).changed).toBe(false);
    expect(conditional).toBe('"v1"');
    expect(await bytes()).toEqual(before);
  });
  it("re-fetches after a 304 when a local override changed", async () => {
    await run();
    await save("manual-overrides.json", { schemaVersion: 1, models: [{ modelId: "test/v1", sourceName: "Manual", sourceUrl: "https://example.com/official", reason: "Exact price correction", verifiedAt: null, patch: { inputPerMillionUsd: 0 } }] });
    let requests = 0;
    const conditionalFetch = async (url, options) => {
      if (url === config.licenseUrl) return new Response(license);
      requests++;
      return options.headers["If-None-Match"] ? new Response(null, { status: 304 }) : new Response(payload);
    };
    clock = "2026-10-26T02:00:00Z";
    expect((await run({ fetchImpl: conditionalFetch })).changed).toBe(true);
    expect(requests).toBe(2);
    expect(JSON.parse((await bytes())[0]).models[0].inputPerMillionUsd).toBe(0);
  });
  it("supports an explicit refresh without inventing price changes", async () => {
    await run(); clock = "2026-10-26T03:00:00Z";
    const result = await run({ force: true });
    expect(result.changed).toBe(true);
    expect(result.reason).toBe("Requested fresh snapshot");
    expect(JSON.parse((await bytes())[0]).generatedAt).toBe(clock);
  });
  it.each(["http", "rate-limit", "network", "timeout", "empty", "json", "schema", "provider", "license", "loss"])("preserves successful snapshots on %s failure", async (kind) => {
    await run(); const before = await bytes();
    if (kind === "http") override = () => new Response("down", { status: 503 });
    if (kind === "rate-limit") override = () => new Response("limited", { status: 429 });
    if (kind === "network") override = () => { throw new Error("network unavailable"); };
    if (kind === "timeout") override = () => { throw new DOMException("timed out", "TimeoutError"); };
    if (kind === "empty") payload = "";
    if (kind === "json") payload = "<html>not json</html>";
    if (kind === "schema") { const raw = JSON.parse(payload); raw.test.models.v1.cost.input = -1; payload = JSON.stringify(raw); }
    if (kind === "provider") payload = "{}";
    if (kind === "license") licenseText = "License changed";
    if (kind === "loss") payload = JSON.stringify({ test: { name: "Test", models: { v1: model("v1") } } });
    await expect(run()).rejects.toThrow();
    expect(await bytes()).toEqual(before);
    expect((await readdir(join(root, "data"))).filter((name) => name.startsWith(".sync-"))).toEqual([]);
  });
  it("rolls back both files if the second atomic replacement fails", async () => {
    await run(); const before = await bytes(); let calls = 0;
    const replacement = async (...args) => { if (++calls === 2) throw new Error("simulated I/O failure"); return rename(...args); };
    await expect(writeSnapshot(root, { replacement: true }, { replacement: true }, replacement)).rejects.toThrow(/I\/O/);
    expect(await bytes()).toEqual(before);
  });
});
