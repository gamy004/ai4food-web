<script lang="ts" setup>
import { Shift, ShiftMapper } from "~~/composables/useDate";
import vSelect from "vue-select";
import { requiredIf } from "@vuelidate/validators";

export interface Props {
  facilityId?: string;
  clearable?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  modelValue?: Shift | null;
  required?: boolean;
}

const attrs = useAttrs();

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

const validationRules = {
  modelValue: {
    requiredIfPropsRequired: requiredIf(() => props.required),
    $lazy: true,
  },
};

const { isInvalid, isFormInvalid } = useValidation(validationRules, {
  modelValue,
});

const shiftRequiredState = computed(() =>
  isFormInvalid("modelValue", ["requiredIfPropsRequired"])
);
</script>

<template>
  <b-form-group
    id="fieldset-shift"
    label-for="shiftName"
    :state="shiftRequiredState"
    v-bind="{ ...attrs }"
  >
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

    <b-form-invalid-feedback v-if="isInvalid" :state="shiftRequiredState">
      กรุณาเลือกกะ
    </b-form-invalid-feedback>
  </b-form-group>
</template>
