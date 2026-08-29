import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/english-learning-website/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "EngUp - Học tiếng Anh mỗi ngày",
        short_name: "EngUp",
        description:
          "EngUp giúp bạn học từ vựng tiếng Anh qua flashcard, luyện tập bằng quiz và ghi nhớ ngữ pháp mỗi ngày.",
        theme_color: "#20af6d",
        background_color: "#f7fbf9",
        display: "standalone",
        start_url: ".",
        scope: ".",
        lang: "vi",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
});
