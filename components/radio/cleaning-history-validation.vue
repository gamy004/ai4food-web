<script lang="ts" setup>
import checkLg from "~icons/bi/check-lg";
import crossIcon from "~icons/akar-icons/cross";
import { UpsertCleaningHistoryValidationData } from "~~/composables/useCleaning";

export interface Props {
  cleaningValidationId: string;
  modelValue: UpsertCleaningHistoryValidationData;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});
</script>

<template>
  <div class="d-flex justify-content-center">
    <b-form-radio
      v-model="props.modelValue.pass"
      :name="`radio-${cleaningValidationId}-pass`"
      :disabled="disabled"
      :value="true"
      button
      button-variant="outline-success"
      class="btn__cleaning-history-validation btn__cleaning-history-validation--pass me-1"
    >
      <checkLg :style="{ fontSize: '1em' }" />
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
      <crossIcon :style="{ fontSize: '1em' }" />
    </b-form-radio>
  </div>
</template>
