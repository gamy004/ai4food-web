<script lang="ts" setup>
import { ComputedRef } from "vue";

export interface Props {
  isCompleted?: boolean | number;
  completeText?: string;
  inCompleteText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
  completeText: "บันทึกเรียบร้อย",
  inCompleteText: "รอบันทึก",
});

const badgeVariant: ComputedRef<string> = computed(() =>
  props.isCompleted ? "success" : "light"
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
