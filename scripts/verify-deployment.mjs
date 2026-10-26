import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const expectedData = readFileSync("data/prices.generated.json", "utf8");
const expectedReport = readFileSync("data/quality-report.json", "utf8");
const packageInfo = JSON.parse(readFileSync("package.json", "utf8"));

export async function verifyDeployment({
  base = new URL(process.env.SITE_URL ?? "https://quelit-vmilned.github.io/llm-price-lens/"),
  expectedCommit = process.env.GITHUB_SHA,
  fetchImpl = fetch,
} = {}) {
  assert.match(expectedCommit ?? "", /^[a-f0-9]{40}$/, "Set GITHUB_SHA to the exact source revision to verify.");
  assert.equal(base.protocol, "https:");
  async function read(path) {
    const url = new URL(path, base);
    url.searchParams.set("revision", expectedCommit);
    const response = await fetchImpl(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.text();
  }
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
  assert.equal(hash(html), release.pageSha256, "The live HTML does not match the requested release.");
  assert.match(html, /Phase 5/);
  assert.match(html, /Imported model prices/);
  assert.doesNotMatch(html, /Project initialized successfully/);
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/g)];
  assert.ok(assets.length >= 2);
  assert.ok(release.assetSha256 && typeof release.assetSha256 === "object", "Missing release asset hashes.");
  for (const [, path] of assets) assert.ok(release.assetSha256[path.slice(2)], `Missing release hash for ${path}`);
  for (const [path, expectedHash] of Object.entries(release.assetSha256)) {
    assert.match(path, /^assets\/[A-Za-z0-9_.-]+\.(?:js|css)$/);
    assert.match(expectedHash, /^[a-f0-9]{64}$/);
    assert.equal(hash(await read(path)), expectedHash, `The live asset does not match the requested release: ${path}`);
  }
  assert.match(await read("licenses/index.html"), /Third-party licenses/);
  return release;
}

// Pages CDN propagation can briefly serve the preceding build. Every retry still
// requires the requested source revision; a timeout fails the workflow.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const base = new URL(process.env.SITE_URL ?? "https://quelit-vmilned.github.io/llm-price-lens/");
  const expectedCommit = process.env.GITHUB_SHA;
  assert.match(expectedCommit ?? "", /^[a-f0-9]{40}$/, "Set GITHUB_SHA to the exact source revision to verify.");
  assert.equal(base.protocol, "https:");
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const release = await verifyDeployment({ base, expectedCommit });
      console.log(`Deployment confirmed: Phase 5, ${release.sourceCommit}, ${release.recordCount} models; page, assets, data and report hashes match.`);
      break;
    } catch (error) {
      if (attempt === 12) throw error;
      console.log(`Waiting for the requested Pages revision (${attempt}/12): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  }
}
