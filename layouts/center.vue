<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup () {
    return {};
  }
});
</script>

<template>
  <div class="container h-100 d-flex flex-column align-items-center justify-content-center">
    <h1 class="text-secondary">
      AI for Food Safety
    </h1>

    <slot />
  </div>
</template>
