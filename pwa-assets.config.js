import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      resizeOptions: { background: "#1B2A1B" }
    },
    transparent: {
      sizes: [192, 512],
      resizeOptions: { background: "#1B2A1B" }
    }
  },
  images: ["public/nmc-icon.svg"]
});
