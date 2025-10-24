/// <reference types="vitest" />
import path from "path";

import { defineConfig } from "vitest/config";

// Try to import react plugin, fallback if it fails
let reactPlugin: () => any;
try {
  const react = require("@vitejs/plugin-react");
  reactPlugin = react.default || react;
} catch (error) {
  console.warn("Failed to load @vitejs/plugin-react:", error);
  reactPlugin = () => ({});
}

export default defineConfig({
  plugins: [reactPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.stories.{js,jsx,ts,tsx}",
        "src/**/__tests__/**",
        "src/**/node_modules/**",
        ".next/",
        "dist/",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components/ui": path.resolve(__dirname, "./components/ui"),
    },
  },
});
