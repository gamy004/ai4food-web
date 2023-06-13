import Icons from "unplugin-icons/vite";
// import eslintPlugin from "vite-plugin-eslint";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  typescript: {
    shim: true,
  },

  ssr: false,

  app: {
    head: {
      title: "Ai4FoodSafety",
      charset: "utf-8",
      viewport:
        "width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes",
      meta: [{ "http-equiv": "X-UA-Compatible", content: "IE=edge" }],
    },
  },

  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "@vuepic/vue-datepicker/src/VueDatePicker/style/main.scss",
    "~/assets/scss/main.scss",
  ],

  plugins: ["~/plugins/useToast.client.ts"],

  build: {
    transpile: ["@vuepic/vue-datepicker"],
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:3001/api",
      cdnUrl: "",
      dashboardConfig: {
        embedUrl: "",
      },
    },
  },

  modules: ["@bootstrap-vue-next/nuxt", "@pinia/nuxt", "@pinia-orm/nuxt"],

  nitro: {
    externals: {
      inline: ["uuid"],
    },
  },

  vite: {
    plugins: [
      Icons({
        // the feature below is experimental ⬇️
        autoInstall: true,
      }),
      // eslintPlugin()
    ],
  },
});
