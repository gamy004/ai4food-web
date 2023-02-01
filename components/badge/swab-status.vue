<script lang="ts" setup>
import { ColorVariant } from "bootstrap-vue-3/src/types";
import { ComputedRef } from "vue";
import { SwabStatus } from "~~/composables/useSwab";

export interface Props {
  swabStatus: SwabStatus;
}

const props = defineProps<Props>();

const badgeVariant: ComputedRef<ColorVariant> = computed(() => {
  let variant: ColorVariant;

  switch (props.swabStatus) {
    case SwabStatus.PENDING:
      variant = "primary";
      break;

    case SwabStatus.NORMAL:
      variant = "success";
      break;

    case SwabStatus.DETECTED:
      variant = "danger";
      break;

    default:
      variant = "light";
      break;
  }

  return variant;
});

const badgeText: ComputedRef<string> = computed(() => {
  return SwabStatusMapper[props.swabStatus];
});
</script>

<template>
  <b-badge :variant="badgeVariant" pill>
    {{ badgeText }}
  </b-badge>
</template>
