import assert from "node:assert/strict";

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
  assert.equal(release.phase, 4);
  assert.equal(release.version, "0.4.0");
  assert.equal(release.dataMode, "sample");
  const html = await read("./");
  assert.match(html, /Phase 4/);
  assert.match(html, /Sample data only/);
  assert.doesNotMatch(html, /Project initialized successfully/);
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/g)];
  assert.ok(assets.length >= 2);
  for (const [, path] of assets) assert.ok((await read(path)).length > 0);
  assert.match(await read("licenses/index.html"), /Third-party licenses/);
  console.log(`Deployment confirmed: ${base.href} — Phase 4, ${expectedCommit}, sample data only.`);
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
