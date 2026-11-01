/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // `import CaretDown from "@/shared/icons/svg/caret-down.svg?react"` gives a React component.
    // Hidden from screen readers by default, like the Untitled icons.
    svgr({ svgrOptions: { svgProps: { "aria-hidden": "true" } } }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Web workers are ES modules (MapLibre's map worker is one).
  worker: { format: "es" },
  test: {
    projects: [
      {
        // Every story runs as a test in a real (headless) Chromium, including a11y checks.
        // https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
        extends: true,
        plugins: [
          storybookTest({ configDir: fileURLToPath(new URL("./.storybook", import.meta.url)) }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
})
