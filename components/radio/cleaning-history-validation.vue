<script lang="ts" setup>
import checkLg from "~icons/bi/check-lg";
import crossIcon from "~icons/akar-icons/cross";
import { UpsertCleaningHistoryValidationData } from "~~/composables/useCleaning";
import { requiredIf } from "@vuelidate/validators";

export interface Props {
  cleaningValidationId: string;
  modelValue: UpsertCleaningHistoryValidationData;
  disabled?: boolean;
  required?: boolean;
  passLabel?: string;
  notPassLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  passLabel: "ผ่าน",
  notPassLabel: "ไม่ผ่าน",
});

const validationRules = {
  pass: {
    requiredIfPropsRequired: requiredIf(() => props.required),
    $lazy: true,
  },
};

const { isInvalid, isFormInvalid } = useValidation(
  validationRules,
  props.modelValue
);
</script>

<template>
  <div class="d-grid">
    <div class="d-flex justify-content-end">
      <b-form-radio
        v-model="props.modelValue.pass"
        :name="`radio-${cleaningValidationId}-pass`"
        :disabled="disabled"
        :value="true"
        button
        button-variant="outline-success"
        class="btn__cleaning-history-validation btn__cleaning-history-validation--pass me-1"
      >
        {{ passLabel }}
      </b-form-radio>

      <b-form-radio
        v-model="props.modelValue.pass"
        :name="`radio-${cleaningValidationId}-not-pass`"
        :disabled="disabled"
        :value="false"
        class="btn__cleaning-history-validation btn__cleaning-history-validation--not-pass me-1"
        button
        button-variant="outline-danger"
      >
        {{ notPassLabel }}
      </b-form-radio>
    </div>

    <b-form-invalid-feedback
      v-if="isInvalid"
      :state="isFormInvalid('pass', ['requiredIfPropsRequired'])"
    >
      กรุณาเลือกตัวเลือกรายการตรวจสอบ
    </b-form-invalid-feedback>
  </div>
</template>
