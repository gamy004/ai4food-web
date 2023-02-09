<script lang="ts" setup>
import { ColorVariant } from "bootstrap-vue-3/src/types";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";

export interface Props {
  active?: boolean;
  activeVariant?: ColorVariant;
  inactiveVariant?: ColorVariant;
  fontSize?: string;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  activeVariant: "success",
  inactiveVariant: "secondary",
  fontSize: "1em",
});
</script>

<template>
  <CarbonCheckmarkFilled
    :style="{
      fontSize: props.fontSize,
      minWidth: '25px',
      marginRight: '0.5rem',
    }"
    :class="{
      [`text-${props.inactiveVariant}`]: !props.active,
      [`text-${props.activeVariant}`]: props.active,
    }"
  />
</template>
