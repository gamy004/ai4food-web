<script lang="ts" setup>
import { UpsertSwabEnvironmentData } from "~~/composables/useSwab";

export interface FormData {
    swabAreaTemperature?: number;
    swabAreaHumidity?: number;
    swabEnvironments?: UpsertSwabEnvironmentData[];
}

export interface FormInvalidData {
    swabAreaTemperature?: boolean | null;
    swabAreaHumidity?: boolean | null;
    swabEnvironments?: boolean | null;
}

export interface Props {
    disabled?: boolean;
    modelValue?: any;
    invalidState?: FormInvalidData
}

const props = withDefaults(
  defineProps<Props>(),
  {
    disabled: false
  }
);

const emit = defineEmits(["update:modelValue"]);

const form = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

</script>

<template>
  <b-row>
    <b-col md="6" class="mt-2">
      <div class="input-group align-items-center">
        <label for="swabAreaTemperature" class="form-label min-w-125px d-block col-12 col-md-auto">อุณหภูมิ
          (°C)</label>

        <div class="form-control p-0 border-0">
          <b-form-input
            id="swabAreaTemperature"
            v-model.number="form.swabAreaTemperature"
            :disabled="disabled"
            type="text"
          />

          <b-form-invalid-feedback :state="props.invalidState?.swabAreaTemperature">
            กรุณากรอกอุณหภูมิ
          </b-form-invalid-feedback>
        </div>
      </div>
    </b-col>

    <b-col md="6" class="mt-2">
      <div class="input-group align-items-center">
        <label for="swabAreaHumidity" class="form-label min-w-125px d-block col-12 col-md-auto">ความชื้น
          (%RH)</label>

        <div class="form-control p-0 border-0">
          <b-form-input
            id="swabAreaHumidity"
            v-model.number="form.swabAreaHumidity"
            :disabled="disabled"
            type="text"
          />

          <b-form-invalid-feedback :state="props.invalidState?.swabAreaHumidity">
            กรุณากรอกความชื้น
          </b-form-invalid-feedback>
        </div>
      </div>
    </b-col>

    <b-col cols="12" class="mt-2">
      <div class="input-group align-items-center">
        <label for="swabEnvironment" class="form-label min-w-125px d-block col-12 col-md-auto">สภาพแวดล้อม
        </label>

        <swab-environment-select
          id="swabEnvironment"
          v-model="form.swabEnvironments"
          class="form-control p-0 border-0"
          :disabled="disabled"
        />

        <b-form-invalid-feedback :state="props.invalidState?.swabEnvironments">
          กรุณาเลือกสภาพแวดล้อมอย่างน้อย 1 ตัวเลือก
        </b-form-invalid-feedback>
      </div>
    </b-col>
  </b-row>
</template>
