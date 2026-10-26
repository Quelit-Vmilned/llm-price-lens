import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const expectedData = readFileSync("data/prices.generated.json", "utf8");
const expectedReport = readFileSync("data/quality-report.json", "utf8");
const packageInfo = JSON.parse(readFileSync("package.json", "utf8"));

const base = new URL(process.env.SITE_URL ?? "https://quelit-vmilned.github.io/llm-price-lens/");
const expectedCommit = process.env.GITHUB_SHA;
assert.match(expectedCommit ?? "", /^[a-f0-9]{40}$/, "Set GITHUB_SHA to the exact source revision to verify.");
assert.equal(base.protocol, "https:");

async function read(path) {
  const url = new URL(path, base);
  url.searchParams.set("revision", expectedCommit);
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
}

async function verify() {
  const release = JSON.parse(await read("release.json"));
  assert.equal(release.sourceCommit, expectedCommit, "The live site is serving a different revision.");
  assert.equal(release.phase, 5);
  assert.equal(release.version, packageInfo.version);
  assert.equal(release.dataMode, "imported");
  assert.equal(release.dataSha256, hash(expectedData));
  assert.equal(release.qualityReportSha256, hash(expectedReport));
  assert.equal(hash(await read("data/prices.json")), release.dataSha256);
  assert.equal(hash(await read("data/quality-report.json")), release.qualityReportSha256);
  assert.equal(hash(await read("data/benchmark-snapshot.json")), hash(readFileSync("data/benchmark-snapshot.json", "utf8")));
  const html = await read("./");
  assert.match(html, /Phase 5/);
  assert.match(html, /Imported model prices/);
  assert.doesNotMatch(html, /Project initialized successfully/);
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/g)];
  assert.ok(assets.length >= 2);
  for (const [, path] of assets) assert.ok((await read(path)).length > 0);
  assert.match(await read("licenses/index.html"), /Third-party licenses/);
  console.log(`Deployment confirmed: ${base.href} — Phase 5, ${expectedCommit}, ${release.recordCount} models, data and report hashes match.`);
}

// Pages CDN propagation can briefly serve the preceding build. Every retry still
// requires the requested source revision; a timeout fails the workflow.
for (let attempt = 1; attempt <= 12; attempt++) {
  try {
    await verify();
    break;
  } catch (error) {
    if (attempt === 12) throw error;
    console.log(`Waiting for the requested Pages revision (${attempt}/12): ${error.message}`);
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}
