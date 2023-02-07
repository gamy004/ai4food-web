<script lang="ts" setup>
import { numeric, requiredIf } from "@vuelidate/validators";
import { UpsertSwabEnvironmentData } from "~~/composables/useSwab";
import SwabArea from "~~/models/SwabArea";

export interface FormData {
  swabAreaTemperature?: number;
  swabAreaHumidity?: number;
  swabEnvironments?: UpsertSwabEnvironmentData[];
}

// export interface FormInvalidData {
//   swabAreaTemperature?: boolean | null;
//   swabAreaHumidity?: boolean | null;
//   swabEnvironments?: boolean | null;
// }

export interface Props {
  swabArea: SwabArea;
  disabled?: boolean;
  modelValue?: any;
  // invalidState?: FormInvalidData;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits(["update:modelValue"]);

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const validationRules = {
  swabAreaTemperature: {
    requiredIfShouldRecordEnvironment: requiredIf(
      () => props.swabArea.shouldRecordEnvironment
    ),
    numeric,
    $lazy: true,
  },
  swabAreaHumidity: {
    requiredIfShouldRecordEnvironment: requiredIf(
      () => props.swabArea.shouldRecordEnvironment
    ),
    numeric,
    $lazy: true,
  },
  swabEnvironments: {
    requiredIfShouldRecordEnvironment: requiredIf(
      () => props.swabArea.shouldRecordEnvironment
    ),
    $lazy: true,
  },
};

const { isFormInvalid } = useValidation(validationRules, form);

const invalidState = computed(() => ({
  swabAreaTemperature: isFormInvalid("swabAreaTemperature", [
    "requiredIfShouldRecordEnvironment",
    "numeric",
  ]),
  swabAreaHumidity: isFormInvalid("swabAreaHumidity", [
    "requiredIfShouldRecordEnvironment",
    "numeric",
  ]),
  swabEnvironments: isFormInvalid("swabEnvironments", [
    "requiredIfShouldRecordEnvironment",
  ]),
}));
</script>

<template>
  <b-row>
    <b-col md="6" class="mt-2">
      <div class="input-group align-items-center">
        <label
          for="swabAreaTemperature"
          class="form-label min-w-125px d-block col-12 col-md-auto"
          >อุณหภูมิ</label
        >

        <div class="form-control p-0 border-0">
          <b-input-group append="°C">
            <b-form-input
              id="swabAreaTemperature"
              v-model.number="form.swabAreaTemperature"
              :disabled="disabled"
              type="text"
            />
          </b-input-group>

          <b-form-invalid-feedback
            :state="
              isFormInvalid('swabAreaTemperature', [
                'requiredIfShouldRecordEnvironment',
              ])
            "
          >
            กรุณากรอกอุณหภูมิ
          </b-form-invalid-feedback>

          <b-form-invalid-feedback
            :state="isFormInvalid('swabAreaTemperature', ['numeric'])"
          >
            อุณหภูมิต้องเป็นตัวเลขเท่านั้น
          </b-form-invalid-feedback>
        </div>
      </div>
    </b-col>

    <b-col md="6" class="mt-2">
      <div class="input-group align-items-center">
        <label
          for="swabAreaHumidity"
          class="form-label min-w-125px d-block col-12 col-md-auto"
          >ความชื้น</label
        >

        <div class="form-control p-0 border-0">
          <b-input-group append="%RH">
            <b-form-input
              id="swabAreaHumidity"
              v-model.number="form.swabAreaHumidity"
              :disabled="disabled"
              type="text"
            />
          </b-input-group>

          <b-form-invalid-feedback
            :state="
              isFormInvalid('swabAreaHumidity', [
                'requiredIfShouldRecordEnvironment',
              ])
            "
          >
            กรุณากรอกความชื้น
          </b-form-invalid-feedback>

          <b-form-invalid-feedback
            :state="isFormInvalid('swabAreaHumidity', ['numeric'])"
          >
            อุณหภูมิต้องเป็นตัวเลขเท่านั้น
          </b-form-invalid-feedback>
        </div>
      </div>
    </b-col>

    <b-col cols="12" class="mt-2">
      <div class="input-group align-items-center">
        <label
          for="swabEnvironment"
          class="form-label min-w-125px d-block col-12 col-md-auto"
          >สภาพแวดล้อม
        </label>

        <swab-environment-select
          id="swabEnvironment"
          v-model="form.swabEnvironments"
          class="form-control p-0 border-0"
          :disabled="disabled"
          :taggable="false"
        />

        <b-form-invalid-feedback :state="invalidState.swabEnvironments">
          กรุณาเลือกสภาพแวดล้อมอย่างน้อย 1 ตัวเลือก
        </b-form-invalid-feedback>
      </div>
    </b-col>
  </b-row>
</template>
