import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  components: [{ path: "~/components", pathPrefix: false }],

  nitro: {
    preset: "cloudflare-module",
    experimental: { tasks: true },
    scheduledTasks: { "*/5 * * * *": ["healthcheck"] },
  },

  app: {
    head: {
      title: "Uptime Monitor",
      meta: [
        {
          name: "description",
          content: "Uptime monitoring powered by Cloudflare Workers",
        },
      ],
    },
  },

  compatibilityDate: "2026-03-12",
});
