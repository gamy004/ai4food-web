<script lang="ts" setup>
import { ColorVariant } from "bootstrap-vue-3/src/types";
import { ComputedRef } from "vue";
import SwabTest from "~~/models/SwabTest";

export interface Props {
  swabTest: SwabTest;
}

const props = defineProps<Props>();

const badgeVariant: ComputedRef<ColorVariant> = computed(() => {
  let variant: ColorVariant = props.swabTest.isRecorded ? "primary" : "light";

  if (props.swabTest.isBacteriaRecorded) {
    variant = props.swabTest.hasBacteria ? "danger" : "success";
  }

  return variant;
});
</script>

<template>
  <b-badge :variant="badgeVariant" pill>
    {{ swabTest.status }}
  </b-badge>
</template>
