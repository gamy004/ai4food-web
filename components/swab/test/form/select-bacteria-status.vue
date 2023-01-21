<script lang="ts" setup>
import vSelect from "vue-select";
import { BacteriaStatus } from "~~/composables/useLab";

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  modelValue?: BacteriaStatus | null;
}

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  showAll: false,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

const bacteriaStatusOptions = ref([
  { value: BacteriaStatus.PENDING, text: "รอผล" },
  { value: BacteriaStatus.DETECTED, text: "พบเชื้อ" },
  { value: BacteriaStatus.NORMAL, text: "ปกติ" },
]);

if (props.showAll) {
  bacteriaStatusOptions.value.unshift({
    value: BacteriaStatus.ALL,
    text: "ทั้งหมด",
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
    :options="bacteriaStatusOptions"
    label="text"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="(option) => option.value"
    deselect-from-dropdown
  >
  </v-select>
</template>
