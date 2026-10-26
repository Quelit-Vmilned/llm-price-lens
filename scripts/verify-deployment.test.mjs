import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { verifyDeployment } from "./verify-deployment.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const expectedCommit = "a".repeat(40);

function deployment() {
  const files = new Map([
    ["index.html", '<h1>Phase 5 · Imported model prices</h1><script src="./assets/app.js"></script><link href="./assets/app.css" rel="stylesheet">'],
    ["assets/app.js", 'import("./lazy.js");'],
    ["assets/app.css", "body { color: black; }"],
    ["assets/lazy.js", 'console.log("requested release");'],
    ["licenses/index.html", "<h1>Third-party licenses</h1>"],
    ...["prices.json", "quality-report.json", "benchmark-snapshot.json"].map((name) => [
      `data/${name}`, readFileSync(`data/${name === "prices.json" ? "prices.generated.json" : name}`, "utf8"),
    ]),
  ]);
  const release = {
    phase: 5,
    version: JSON.parse(readFileSync("package.json", "utf8")).version,
    sourceCommit: expectedCommit,
    dataMode: "imported",
    recordCount: JSON.parse(files.get("data/prices.json")).models.length,
    dataSha256: hash(files.get("data/prices.json")),
    qualityReportSha256: hash(files.get("data/quality-report.json")),
    pageSha256: hash(files.get("index.html")),
    assetSha256: Object.fromEntries([...files].filter(([path]) => path.startsWith("assets/")).map(([path, body]) => [path, hash(body)])),
  };
  const requests = [];
  const fetchImpl = async (url) => {
    expect(url.origin).toBe("https://example.com");
    expect(url.searchParams.get("revision")).toBe(expectedCommit);
    const path = url.pathname.slice("/project/".length) || "index.html";
    requests.push(path);
    const body = path === "release.json" ? JSON.stringify(release) : files.get(path);
    return new Response(body ?? "Missing", { status: body === undefined ? 404 : 200 });
  };
  const run = () => verifyDeployment({ base: new URL("https://example.com/project/"), expectedCommit, fetchImpl });
  return { files, release, requests, run };
}

describe("deployment content integrity", () => {
  it("accepts matching content under a Pages subpath, including lazy chunks", async () => {
    const site = deployment();
    expect(await site.run()).toEqual(site.release);
    expect(site.requests).toContain("assets/lazy.js");
  });

  it("rejects stale HTML even when the release identity and data already match", async () => {
    const site = deployment();
    site.files.set("index.html", site.files.get("index.html") + "<!-- previous page -->");
    await expect(site.run()).rejects.toThrow(/live HTML/);
  });

  it.each(["assets/app.js", "assets/app.css", "assets/lazy.js"])("rejects HTTP 200 error pages in place of %s", async (path) => {
    const site = deployment();
    site.files.set(path, "<html><h1>404: stale CDN asset</h1></html>");
    await expect(site.run()).rejects.toThrow(/live asset/);
  });

  it("rejects an HTML asset omitted from the release manifest", async () => {
    const site = deployment();
    delete site.release.assetSha256["assets/app.js"];
    await expect(site.run()).rejects.toThrow(/Missing release hash/);
  });

  it("rejects an asset outside the release asset directory before requesting it", async () => {
    const site = deployment();
    site.release.assetSha256["../unexpected.js"] = "b".repeat(64);
    await expect(site.run()).rejects.toThrow();
    expect(site.requests).not.toContain("../unexpected.js");
  });

  it("rejects a different source revision", async () => {
    const site = deployment();
    site.release.sourceCommit = "b".repeat(40);
    await expect(site.run()).rejects.toThrow(/different revision/);
  });
});
