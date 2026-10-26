import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { priceDatasetSchema, benchmarkSnapshotSchema } from "../src/schema.ts";
import { qualityReportSchema } from "../src/pipeline.ts";

const read = (path) => readFileSync(resolve(path));
const hash = (path) => createHash("sha256").update(read(path)).digest("hex");
const release = JSON.parse(read("dist/release.json"));
const packageInfo = JSON.parse(read("package.json"));
assert.equal(release.phase, 5);
assert.equal(release.version, packageInfo.version);
assert.equal(release.dataMode, "imported");
assert.equal(release.sourceCommit, process.env.GITHUB_SHA ?? "local");

const html = read("dist/index.html").toString();
assert.match(html, /Phase 5/);
assert.match(html, /Imported model prices/);
assert.doesNotMatch(html, /Sample data only/);
const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/g)];
assert.ok(assets.length >= 2, "The page must use relative JS and CSS assets.");
for (const [, asset] of assets) assert.ok(existsSync(resolve("dist", asset)));

const dataset = priceDatasetSchema.parse(JSON.parse(read("dist/data/prices.json")));
const report = qualityReportSchema.parse(JSON.parse(read("dist/data/quality-report.json")));
benchmarkSnapshotSchema.parse(JSON.parse(read("dist/data/benchmark-snapshot.json")));
assert.ok(dataset.models.length > 0);
assert.ok(dataset.models.every((model) => !model.modelId.startsWith("sample-") && model.sourceUrl !== null));
assert.equal(dataset.generatedAt, report.generatedAt);
assert.equal(dataset.generatedAt, release.dataGeneratedAt);
assert.equal(dataset.models.length, report.recordCount);
assert.equal(dataset.models.length, release.recordCount);
assert.equal(hash("dist/data/prices.json"), hash("data/prices.generated.json"));
assert.equal(hash("dist/data/quality-report.json"), hash("data/quality-report.json"));
assert.equal(hash("dist/data/prices.json"), release.dataSha256);
assert.equal(hash("dist/data/quality-report.json"), release.qualityReportSha256);
assert.doesNotMatch(read("src/data.ts").toString(), /prices\.sample/);

const licenses = readdirSync("THIRD_PARTY_LICENSES");
for (const name of licenses) {
  assert.equal(hash(`THIRD_PARTY_LICENSES/${name}`), hash(`public/licenses/${name}`));
  assert.equal(hash(`THIRD_PARTY_LICENSES/${name}`), hash(`dist/licenses/${name}`));
}
assert.ok(existsSync("dist/licenses/index.html"));
const secretOrLocalPath = /\/Users\/|\/home\/[^/\s]+\/|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
for (const path of ["dist/index.html", "dist/release.json", "dist/data/prices.json", "dist/data/quality-report.json", ...assets.map(([, asset]) => `dist/${asset}`)]) {
  assert.ok(!secretOrLocalPath.test(read(path).toString()), `Unexpected private value in ${path}`);
}
console.log(`Build verified: Phase ${release.phase}, v${release.version}, ${release.sourceCommit}, ${dataset.models.length} imported models, ${licenses.length} license files.`);
