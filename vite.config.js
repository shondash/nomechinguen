import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "pwa-192x192.png",
        "pwa-512x512.png",
        "maskable-icon-512x512.png",
        "volante.pdf",
        "og-image.webp"
      ],
      manifest: {
        name: "No Me Chinguen",
        short_name: "NMC",
        description: "Conoce y ejerce tus derechos laborales bajo la Ley Federal del Trabajo",
        theme_color: "#1B2A1B",
        background_color: "#F5F1EB",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "es-MX",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,webp,pdf,svg,ico}"]
      }
    })
  ],
});
