import { defineNuxtConfig } from "nuxt";
import Icons from "unplugin-icons/vite";
// import eslintPlugin from "vite-plugin-eslint";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false,

  target: "static",

  meta: {
    title: "Ai4FoodSafety",
    charset: "utf-8",
    name: "viewport",
    content:
      "width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes, ie=edge"
  },

  css: ["~/assets/scss/main.scss"],

  plugins: ["~/plugins/useToast.client.ts"],

  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:3001/api"
    }
  },

  modules: [
    "bootstrap-vue-3/nuxt",
    "cookie-universal-nuxt",
    "@pinia/nuxt",
    "@pinia-orm/nuxt"
  ],

  nitro: {
    externals: {
      inline: ["uuid"]
    }
  },

  vite: {
    plugins: [
      Icons({
        // the feature below is experimental ⬇️
        autoInstall: true
      })
      // eslintPlugin()
    ]
  }
});
