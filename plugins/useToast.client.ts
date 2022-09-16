import Toast, { PluginOptions, POSITION } from "vue-toastification";

export default defineNuxtPlugin((nuxtApp) => {
  console.log("[vue-toastification] installed");

  const options: PluginOptions = {
    shareAppContext: true,
    position: POSITION.TOP_CENTER,
    timeout: 3000
  };

  nuxtApp.vueApp.use(
    Toast,
    options
  );
});
