<script lang="ts" setup>
import { ColorVariant } from "bootstrap-vue-3/src/types";
import { ComputedRef } from "vue";

export interface Props {
  isCompleted?: boolean | number;
  completeText?: string;
  inCompleteText?: string;
  completeVariant?: ColorVariant;
  inCompleteVariant?: ColorVariant;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
  completeText: "บันทึกเรียบร้อย",
  inCompleteText: "รอบันทึก",
  completeVariant: "success",
  inCompleteVariant: "light",
});

const badgeVariant: ComputedRef<string> = computed(() =>
  props.isCompleted ? props.completeVariant : props.inCompleteVariant
);

const badgeText: ComputedRef<string> = computed(() =>
  props.isCompleted ? props.completeText : props.inCompleteText
);
</script>

<template>
  <b-badge :variant="badgeVariant" pill>
    {{ badgeText }}
  </b-badge>
</template>
