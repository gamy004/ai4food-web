<script lang="ts" setup>
import Alignment from "bootstrap-vue-3/src/types/Alignment";

export interface Props {
  modelValue: number;
  perPage: number;
  totalRows: number;
  align?: Alignment;
}

const { updateQueryParams, getCurrentQuery } = useQueryParams();

const props = withDefaults(defineProps<Props>(), {
  align: "center",
});

const emit = defineEmits(["update:modelValue"]);

const currentPage = computed({
  get: () => {
    return props.modelValue;
  },

  set: (currentPage) => {
    console.log(currentPage);

    updateQueryParams({
      ...getCurrentQuery(),
      currentPage,
    });

    console.log({
      currentPage,
    });

    emit("update:modelValue", currentPage);
  },
});
</script>

<template>
  <b-pagination
    v-model="currentPage"
    :align="align"
    :total-rows="totalRows"
    :per-page="perPage"
    first-number
    last-number
  />
</template>
