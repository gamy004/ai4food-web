import Icons from "unplugin-icons/vite";
// import eslintPlugin from "vite-plugin-eslint";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  typescript: {
    shim: true,
  },

  ssr: false,

  target: "static",

  head: {
    meta: [
      {
        title: "Ai4FoodSafety",
        name: "viewport",
        content:
          "width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes, ie=edge",
      },
      {
        charset: "utf-8",
      },
    ],
  },

  css: ["~/assets/scss/main.scss"],

  plugins: ["~/plugins/useToast.client.ts"],

  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:3001/api",
      cdnUrl: "",
    },
  },

  modules: ["bootstrap-vue-3/nuxt", "@pinia/nuxt", "@pinia-orm/nuxt"],

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
