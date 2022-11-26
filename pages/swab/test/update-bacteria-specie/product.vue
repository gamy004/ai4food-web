<script lang="ts" setup>
import { FormData as SwabTestFilterFormData } from "~~/components/swab/test/filter.vue";
import { Pagination } from "~~/composables/usePagination";

export interface Props {
  modelValue: SwabTestFilterFormData;
  pagination: Pagination;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: () => usePagination({ perPage: 20, currentPage: 1 }),
});

const emit = defineEmits(["update:modelValue"]);

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <swab-test-table-product
    v-model="form"
    :pagination="pagination"
    edit-specie
  ></swab-test-table-product>
</template>
