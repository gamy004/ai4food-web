<script lang="ts" setup>
import { Shift, ShiftMapper } from "~~/composables/useDate";
import vSelect from "vue-select";

export interface Props {
  facilityId?: string;
  clearable?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  modelValue?: Shift | null;
}

const props = withDefaults(defineProps<Props>(), {
  facilityId: null,
  clearable: false,
  disabled: false,
  showAll: false,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

const shiftOptions = ref([
  { value: Shift.DAY, text: ShiftMapper[Shift.DAY] },
  { value: Shift.NIGHT, text: ShiftMapper[Shift.NIGHT] },
]);

if (props.showAll) {
  shiftOptions.value.unshift({
    value: Shift.ALL,
    text: ShiftMapper[Shift.ALL],
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
    :options="shiftOptions"
    label="text"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="(option) => option.value"
    deselect-from-dropdown
  >
  </v-select>
</template>
