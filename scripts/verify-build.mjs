import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(path));
const hash = (path) => createHash("sha256").update(read(path)).digest("hex");
const release = JSON.parse(read("dist/release.json"));
const packageInfo = JSON.parse(read("package.json"));
assert.equal(release.phase, 4);
assert.equal(release.version, packageInfo.version);
assert.equal(release.dataMode, "sample");
assert.equal(release.sourceCommit, process.env.GITHUB_SHA ?? "local");

const html = read("dist/index.html").toString();
assert.match(html, /Phase 4/);
assert.match(html, /Sample data only/);
const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/g)];
assert.ok(assets.length >= 2, "The page must use relative JS and CSS assets.");
for (const [, asset] of assets) assert.ok(existsSync(resolve("dist", asset)));

const sample = JSON.parse(read("data/prices.sample.json"));
assert.equal(sample.models.length, 5);
assert.ok(sample.warnings.includes("示例数据，非生产价格"));
assert.ok(sample.models.every((model) => model.modelId.startsWith("sample-") && model.status === "needs-review"));
assert.equal(JSON.parse(read("data/prices.generated.json")).models.length, 0);
assert.equal(JSON.parse(read("data/benchmark-snapshot.json")).models.length, 0);

const licenses = readdirSync("THIRD_PARTY_LICENSES");
for (const name of licenses) {
  assert.equal(hash(`THIRD_PARTY_LICENSES/${name}`), hash(`public/licenses/${name}`));
  assert.equal(hash(`THIRD_PARTY_LICENSES/${name}`), hash(`dist/licenses/${name}`));
}
assert.ok(existsSync("dist/licenses/index.html"));
const secretOrLocalPath = /\/Users\/|\/home\/[^/\s]+\/|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
for (const path of ["dist/index.html", "dist/release.json", ...assets.map(([, asset]) => `dist/${asset}`)]) {
  assert.ok(!secretOrLocalPath.test(read(path).toString()), `Unexpected private value in ${path}`);
}
console.log(`Build verified: Phase ${release.phase}, v${release.version}, ${release.sourceCommit}, ${licenses.length} license files, sample data only.`);
