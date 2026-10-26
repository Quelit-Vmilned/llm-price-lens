import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import packageInfo from "./package.json" with { type: "json" };

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
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "release.json",
          source: JSON.stringify({
            phase: 4,
            version: packageInfo.version,
            sourceCommit,
            dataMode: "sample",
          }, null, 2) + "\n",
        });
      },
    }],
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
