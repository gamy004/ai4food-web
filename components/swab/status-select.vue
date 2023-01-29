<script lang="ts" setup>
import vSelect from "vue-select";
import { SwabStatus, SwabStatusMapper } from "~~/composables/useSwab";

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  modelValue?: SwabStatus | null;
  options?: SwabStatus[];
}

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  showAll: false,
  modelValue: null,
  options: () => [SwabStatus.PENDING, SwabStatus.DETECTED, SwabStatus.NORMAL],
});

const emit = defineEmits(["update:modelValue"]);

const swabStatusOptions = computed(() => {
  const displayedOptions = props.options.map((swabStatus) => {
    return { value: swabStatus, text: SwabStatusMapper[swabStatus] };
  });

  if (props.showAll) {
    displayedOptions.unshift({
      value: SwabStatus.ALL,
      text: SwabStatusMapper.all,
    });
  }

  return displayedOptions;
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <v-select
    v-model="modelValue"
    :options="swabStatusOptions"
    label="text"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="(option) => option.value"
    deselect-from-dropdown
  >
  </v-select>
</template>
