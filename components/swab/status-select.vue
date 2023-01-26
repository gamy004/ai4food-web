<script lang="ts" setup>
import vSelect from "vue-select";
import { SwabStatus, SwabStatusMapper } from "~~/composables/useSwab";

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  modelValue?: SwabStatus | null;
}

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  showAll: false,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

const SwabStatusOptions = ref([
  { value: SwabStatus.PENDING, text: SwabStatusMapper.pending },
  { value: SwabStatus.DETECTED, text: SwabStatusMapper.detected },
  { value: SwabStatus.NORMAL, text: SwabStatusMapper.normal },
]);

if (props.showAll) {
  SwabStatusOptions.value.unshift({
    value: SwabStatus.ALL,
    text: SwabStatusMapper.all,
  });
}

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <v-select
    v-model="modelValue"
    :options="SwabStatusOptions"
    label="text"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="(option) => option.value"
    deselect-from-dropdown
  >
  </v-select>
</template>
