import { defineConfig } from "vitest/config";

export default defineConfig({
  // Relative base so the built artifact is path-portable: the same dist works
  // when served under any subpath (production is www.knue.ac.kr/s/) or at root.
  base: "./",
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Vitest 4: thresholds must nest under `thresholds` (flat keys are not
      // valid CoverageOptions and are not applied as a gate).
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
