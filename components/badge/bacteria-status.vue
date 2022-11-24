<script lang="ts" setup>
import { ColorVariant } from "bootstrap-vue-3/src/types";
import { ComputedRef } from "vue";
import { useLab } from "~~/composables/useLab";
import SwabTest from "~~/models/SwabTest";

export interface Props {
  swabTest: SwabTest;
}

const { getBacteriaBySwabTestId } = useLab();

const props = defineProps<Props>();

const isRecorded: ComputedRef<boolean> = computed(() => {
  return props.swabTest.swabTestRecordedAt !== null;
});

const hasBacteria: ComputedRef<boolean> = computed(() => {
  const bacteria = getBacteriaBySwabTestId(props.swabTest.id);

  return bacteria && bacteria.length > 0;
});

const badgeVariant: ComputedRef<ColorVariant> = computed(() => {
  let variant: ColorVariant = "primary";

  if (isRecorded.value) {
    variant = hasBacteria.value ? "danger" : "success";
  }

  return variant;
});

const badgeText: ComputedRef<string> = computed(() => {
  let text = "รอผล";

  if (isRecorded.value) {
    text = hasBacteria.value ? "พบเชื้อ" : "ปกติ";
  }

  return text;
});
</script>

<template>
  <b-badge :variant="badgeVariant" pill>
    {{ badgeText }}
  </b-badge>
</template>
