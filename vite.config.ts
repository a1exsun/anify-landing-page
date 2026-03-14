import fs from "fs";
import path from "path";

import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

function sparkPolyfillPlugin(): Plugin {
  let polyfillCode = "";

  return {
    configResolved() {
      const polyfillPath = path.resolve(
        __dirname,
        "node_modules/compression-streams-polyfill/umd/index.js",
      );

      polyfillCode = fs.readFileSync(polyfillPath, "utf-8");
      polyfillCode = polyfillCode
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n");
    },
    enforce: "pre",
    name: "spark-polyfill",
    transform(code, id) {
      if (!id.includes("@sparkjsdev/spark") || !code.includes("const jsContent = '")) {
        return null;
      }

      const modifiedCode = code.replace(
        /(const jsContent = '\(function\(\)\s*\{\\n\s*"use strict";)/g,
        `$1${polyfillCode};`,
      );

      if (modifiedCode !== code) {
        return { code: modifiedCode, map: null };
      }

      const altCode = code.replace(
        `const jsContent = '(function() {\\n  "use strict";`,
        `const jsContent = '(function() {\\n  ${polyfillCode};\\n  "use strict";`,
      );

      if (altCode !== code) {
        return { code: altCode, map: null };
      }

      return null;
    },
  };
}

export default defineConfig({
  optimizeDeps: {
    exclude: ["@sparkjsdev/spark"],
  },
  plugins: [sparkPolyfillPlugin(), tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
