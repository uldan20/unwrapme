import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The templates are ported as-is from the album they were built in, which
  // reads browser state (storage, media queries, the clock) in effects after
  // mount. Rewriting that to satisfy the newer hooks rules risks the behaviour,
  // so those two rules are off there only.
  {
    files: ["templates/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Copied from maplibre-gl by scripts/copy-map-worker.mjs.
    "public/vendor/**",
  ]),
]);

export default eslintConfig;
