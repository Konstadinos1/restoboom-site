import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  // tsconfig keeps jsx: "preserve" for Next; tests need the automatic runtime to import .tsx modules.
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    coverage: { provider: "v8", include: ["lib/**/*.ts", "supabase/functions/_shared/**/*.ts", "components/diagnostic/useLeadSubmission.ts"], exclude: ["lib/scene/emberCrystal.ts", "lib/fonts.ts"] },
  },
});
