<script lang="ts" setup>
import { models } from "powerbi-client";

definePageMeta({
  title: "Ai4FoodSafety - Dashboard",

  middleware: ["auth"],

  canGoBack: true,
});

const config = useRuntimeConfig();

const dashboardConfig = config.public.dashboardConfig ?? {
  type: "report",
  embedUrl: undefined,
  tokenType: models.TokenType.Embed,
  accessToken: undefined,
  settings: undefined,
};
</script>

<template>
  <div class="page__dashboard mt-4">
    <iframe
      title="AI Food Safety Dashboard"
      class="responsive-iframe"
      :src="dashboardConfig.embedUrl"
      frameborder="0"
      allowFullScreen="true"
    ></iframe>
  </div>
</template>

<style scoped lang="scss">
.page__dashboard {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
}

/* Then style the iframe to fit in the container div with full height and width */
.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>
