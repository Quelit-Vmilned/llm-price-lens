import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSnapshot, sourceConfigSchema, overridesSchema, benchmarkAliasesSchema, qualityReportSchema } from "../src/pipeline.ts";
import { benchmarkSnapshotSchema, priceDatasetSchema } from "../src/schema.ts";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const optionalRead = async (path) => {
  try { return await readFile(path, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
};

async function request(url, fetchImpl, headers = {}, allowNotModified = false) {
  const response = await fetchImpl(url, {
    headers: { "User-Agent": "llm-price-lens/0.5 (public pricing synchronization)", ...headers },
    signal: AbortSignal.timeout(20_000), redirect: "error",
  });
  if (response.status === 304 && allowNotModified) return { response, body: null };
  if (!response.ok) throw new Error(`Upstream request failed: ${new URL(url).hostname} HTTP ${response.status}`);
  const body = await response.text();
  if (!body.trim()) throw new Error("Upstream response was empty");
  if (Buffer.byteLength(body) > 25 * 1024 * 1024) throw new Error("Upstream response exceeds the 25 MiB limit");
  return { response, body };
}

// Stage both files before replacing either. A failed rename restores the exact
// previous bytes; HTTP/JSON/schema/merge failures never enter this function.
export async function writeSnapshot(root, dataset, report, renameImpl = rename) {
  const dataDir = join(root, "data");
  const stage = join(dataDir, `.sync-${randomUUID()}`);
  const names = ["prices.generated.json", "quality-report.json"];
  const old = await Promise.all(names.map((name) => optionalRead(join(dataDir, name))));
  await mkdir(stage, { recursive: true });
  try {
    await Promise.all([writeFile(join(stage, names[0]), json(dataset)), writeFile(join(stage, names[1]), json(report))]);
    for (const name of names) await renameImpl(join(stage, name), join(dataDir, name));
  } catch (error) {
    for (let index = 0; index < names.length; index++) {
      const target = join(dataDir, names[index]);
      if (old[index] === null) await rm(target, { force: true });
      else {
        const backup = join(stage, `restore-${index}`);
        await writeFile(backup, old[index]);
        await rename(backup, target);
      }
    }
    throw error;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

export async function syncData({ root = process.cwd(), force = false, fetchImpl = fetch, now = () => new Date().toISOString() } = {}) {
  const load = async (name) => JSON.parse(await readFile(join(root, "data", name), "utf8"));
  const [rawConfig, rawOverrides, rawBenchmark, rawAliases, previousText, reportText, pipelineCode, schemaCode] = await Promise.all([
    load("sources.json"), load("manual-overrides.json"), load("benchmark-snapshot.json"), load("benchmark-aliases.json"),
    optionalRead(join(root, "data/prices.generated.json")), optionalRead(join(root, "data/quality-report.json")),
    readFile(join(root, "src/pipeline.ts"), "utf8"), readFile(join(root, "src/schema.ts"), "utf8"),
  ]);
  const config = sourceConfigSchema.parse(rawConfig);
  const overrides = overridesSchema.parse(rawOverrides);
  const benchmark = benchmarkSnapshotSchema.parse(rawBenchmark);
  const aliases = benchmarkAliasesSchema.parse(rawAliases);
  const previous = previousText === null ? null : priceDatasetSchema.parse(JSON.parse(previousText));
  const previousReport = reportText === null ? null : qualityReportSchema.parse(JSON.parse(reportText));
  if (previousReport && (previous?.generatedAt !== previousReport.generatedAt || previous.models.length !== previousReport.recordCount)) {
    throw new Error("Previous data and quality report are inconsistent; refusing to discard evidence");
  }
  if (previous?.models.length && !previousReport) throw new Error("Previous production data has no quality report");

  const localHash = sha256(JSON.stringify({ config, overrides, benchmark, aliases, pipelineCode, schemaCode }));
  const inputHashFor = (payloadSha256) => sha256(`${payloadSha256}:${localHash}`);
  const oldSource = previousReport?.sources.find((source) => source.url === config.url);
  const headers = !force && oldSource?.etag ? { "If-None-Match": oldSource.etag } : {};
  const [license, initialPayload] = await Promise.all([
    request(config.licenseUrl, fetchImpl), request(config.url, fetchImpl, headers, Boolean(headers["If-None-Match"])),
  ]);
  if (sha256(license.body) !== config.licenseSha256) throw new Error("Upstream license changed; review required before importing new data");
  let payload = initialPayload;
  if (payload.body === null) {
    if (oldSource && previousReport.inputHash === inputHashFor(oldSource.payloadSha256)) {
      return { changed: false, reason: "HTTP 304; upstream and local inputs unchanged", recordCount: previous.models.length, generatedAt: previous.generatedAt };
    }
    // A local override/mapping/parser changed; a 304 cannot supply the raw data
    // needed to re-normalize, so re-fetch without the conditional header.
    payload = await request(config.url, fetchImpl);
  }
  const payloadSha256 = sha256(payload.body);
  const inputHash = inputHashFor(payloadSha256);
  if (!force && previousReport?.inputHash === inputHash) {
    return { changed: false, reason: "Payload and local inputs unchanged", recordCount: previous.models.length, generatedAt: previous.generatedAt };
  }
  let raw;
  try { raw = JSON.parse(payload.body); }
  catch { throw new Error("Upstream returned invalid JSON; last successful snapshot retained"); }
  const { dataset, report } = buildSnapshot({
    raw, config, overrides, benchmark, aliases, previous, generatedAt: now(), inputHash,
    source: {
      name: config.name, url: config.url, repository: config.repository,
      auditedCommit: config.auditedCommit, license: config.license, licenseSha256: config.licenseSha256,
      payloadSha256, etag: payload.response.headers.get("etag"), lastModified: payload.response.headers.get("last-modified"),
    },
  });
  await writeSnapshot(root, dataset, report);
  return { changed: true, reason: force ? "Requested fresh snapshot" : "Source or local inputs changed", recordCount: dataset.models.length, generatedAt: dataset.generatedAt, payloadSha256 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== "--force")) throw new Error("Usage: npm run sync:data -- [--force]");
    const result = await syncData({ force: args.includes("--force") });
    console.log(JSON.stringify(result, null, 2));
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${result.changed}\n`);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,
      `### Pricing synchronization\n\n${result.reason}. ${result.recordCount} models. Last successful data sync: ${result.generatedAt}.\n`);
  } catch (error) {
    console.error(`Data sync failed; last successful snapshot retained: ${error.message}`);
    process.exitCode = 1;
  }
}
