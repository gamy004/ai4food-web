<script lang="ts" setup>
import { FormData as SwabTestFilterFormData } from "~~/components/swab/test/filter.vue";

export interface Props {
  modelValue: SwabTestFilterFormData;
  perPage?: number;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 100,
  currentPage: 1,
});

const emit = defineEmits(["update:modelValue"]);

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <swab-test-table-area
    v-model="form"
    :per-page="perPage"
    :current-page="currentPage"
  ></swab-test-table-area>
</template>
