<script lang="ts" setup>
import { useToast } from "vue-toastification";
import vSelect from "vue-select";
import { requiredIf } from "@vuelidate/validators";
import { CleaningType, CleaningTypeMapper } from "~~/models/CleaningHistory";

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  showLabel?: boolean;
  modelValue?: CleaningType | null;
}

const attrs = useAttrs();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  required: false,
  showLabel: true,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

// const isFetched = ref(false);
const loading = ref(false);

const cleaningTypeOptions = computed(() => {
  return Object.values(CleaningType);
});

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

const cleaningTypeRequiredState = computed(() =>
  isFormInvalid("modelValue", ["requiredIfPropsRequired"])
);

const formGroupLabel = computed(() =>
  props.showLabel ? "วิธีทำความสะอาด" : ""
);

const formGroupLabelClass = computed(() => (!props.showLabel ? "p-0" : ""));
</script>

<template>
  <b-form-group
    id="fieldset-cleaning-program"
    label-for="cleaningType"
    :label="formGroupLabel"
    :label-class="formGroupLabelClass"
    :state="cleaningTypeRequiredState"
    v-bind="{ ...attrs }"
  >
    <v-select
      v-model="modelValue"
      :options="cleaningTypeOptions"
      :loading="loading"
      :clearable="clearable"
      :disabled="disabled"
      deselect-from-dropdown
    >
      <template #selected-option="{ label }">
        {{ CleaningTypeMapper[label] }}
      </template>

      <template #option="{ label }">
        {{ CleaningTypeMapper[label] }}
      </template>
    </v-select>

    <b-form-invalid-feedback
      v-if="isInvalid"
      :state="cleaningTypeRequiredState"
    >
      กรุณาเลือกวิธีทำความสะอาด
    </b-form-invalid-feedback>
  </b-form-group>
</template>
