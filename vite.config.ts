import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import packageInfo from "./package.json" with { type: "json" };
import generatedPrices from "./data/prices.generated.json" with { type: "json" };
import generatedReport from "./data/quality-report.json" with { type: "json" };
import benchmark from "./data/benchmark-snapshot.json" with { type: "json" };
import { priceDatasetSchema, benchmarkSnapshotSchema } from "./src/schema.ts";
import { qualityReportSchema } from "./src/pipeline.ts";

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default defineConfig(({ mode }) => {
  const sourceCommit = loadEnv(mode, ".", ["GITHUB_SHA"]).GITHUB_SHA ?? "local";
  if (sourceCommit !== "local" && !/^[a-f0-9]{40}$/.test(sourceCommit)) {
    throw new Error("GITHUB_SHA must be a full Git commit SHA.");
  }

  return {
    base: "./",
    define: {
      __APP_VERSION__: JSON.stringify(packageInfo.version),
      __BUILD_COMMIT__: JSON.stringify(sourceCommit),
    },
    plugins: [{
      name: "release-identity",
      enforce: "post",
      async generateBundle(_, bundle) {
        const page = bundle["index.html"];
        if (page?.type !== "asset" || typeof page.source !== "string") {
          throw new Error("Release identity requires the final HTML page.");
        }
        const assetSha256 = Object.fromEntries(await Promise.all(
          Object.entries(bundle)
            .filter(([path]) => path.startsWith("assets/") && /\.(?:js|css)$/.test(path))
            .map(async ([path, asset]) => [path, await sha256(asset.type === "chunk"
              ? asset.code
              : typeof asset.source === "string" ? asset.source : new TextDecoder().decode(asset.source))]),
        ));
        const datasetText = JSON.stringify(generatedPrices, null, 2) + "\n";
        const reportText = JSON.stringify(generatedReport, null, 2) + "\n";
        const benchmarkText = JSON.stringify(benchmark, null, 2) + "\n";
        const dataset = priceDatasetSchema.parse(JSON.parse(datasetText));
        const report = qualityReportSchema.parse(JSON.parse(reportText));
        benchmarkSnapshotSchema.parse(JSON.parse(benchmarkText));
        if (!dataset.models.length || report.recordCount !== dataset.models.length || report.generatedAt !== dataset.generatedAt) {
          throw new Error("Production data and quality report must describe the same nonempty snapshot.");
        }
        for (const [fileName, source] of [["data/prices.json", datasetText], ["data/quality-report.json", reportText], ["data/benchmark-snapshot.json", benchmarkText]]) {
          this.emitFile({ type: "asset", fileName, source });
        }
        this.emitFile({
          type: "asset",
          fileName: "release.json",
          source: JSON.stringify({
            phase: 5,
            version: packageInfo.version,
            sourceCommit,
            dataMode: "imported",
            dataGeneratedAt: dataset.generatedAt,
            recordCount: dataset.models.length,
            dataSha256: await sha256(datasetText),
            qualityReportSha256: await sha256(reportText),
            pageSha256: await sha256(page.source),
            assetSha256,
          }, null, 2) + "\n",
        });
      },
    }],
    test: {
      environment: "node",
      include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    },
  };
});
