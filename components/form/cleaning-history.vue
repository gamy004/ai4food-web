<script lang="ts" setup>
import DatePicker from "@vuepic/vue-datepicker";
import { required } from "@vuelidate/validators";
import { UpdateCleaningHistoryBody } from "~~/composables/useCleaning";

export interface Props {
  disabled?: boolean;
  modelValue: UpdateCleaningHistoryBody;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const { onlyDate, toTimestamp } = useDate();
const { dateLesserThan } = useValidationRule();
const formCleaningHistoryStartedAtDate = computed({
  get: () => {
    return props.modelValue.cleaningHistoryStartedAtDate;
  },

  set: (date) => {
    props.modelValue.cleaningHistoryStartedAtDate = onlyDate(date);

    if (props.modelValue.cleaningHistoryStartedAtTime) {
      props.modelValue.cleaningHistoryStartedAt = toTimestamp(
        props.modelValue.cleaningHistoryStartedAtDate,
        props.modelValue.cleaningHistoryStartedAtTime
      );
    }
  },
});

const formCleaningHistoryEndedAtDate = computed({
  get: () => {
    return props.modelValue.cleaningHistoryEndedAtDate;
  },

  set: (date) => {
    props.modelValue.cleaningHistoryEndedAtDate = onlyDate(date);

    if (props.modelValue.cleaningHistoryEndedAtTime) {
      props.modelValue.cleaningHistoryEndedAt = toTimestamp(
        props.modelValue.cleaningHistoryEndedAtDate,
        props.modelValue.cleaningHistoryEndedAtTime
      );
    }
  },
});

const validationRules = computed(() => ({
  cleaningHistoryStartedAtTime: {
    required,
    $lazy: true,
  },
  cleaningHistoryEndedAtTime: {
    required,
    $lazy: true,
  },
  cleaningHistoryStartedAt: {
    dateLesserThan: dateLesserThan(props.modelValue.cleaningHistoryEndedAt),
    $lazy: true,
  },
  // cleaningHistoryEndedAt: {
  //   dateGreaterThan: dateGreaterThan(form.cleaningHistoryStartedAt),
  //   $lazy: true,
  // },
}));

const { isFormInvalid } = useValidation(validationRules, props.modelValue);

watch(
  () => props.modelValue.cleaningHistoryStartedAtTime,
  (timeObject) => {
    if (props.modelValue.cleaningHistoryStartedAtDate) {
      props.modelValue.cleaningHistoryStartedAt = toTimestamp(
        props.modelValue.cleaningHistoryStartedAtDate,
        timeObject
      );
    }
  }
);

watch(
  () => props.modelValue.cleaningHistoryEndedAtTime,
  (timeObject) => {
    if (props.modelValue.cleaningHistoryEndedAtDate) {
      props.modelValue.cleaningHistoryEndedAt = toTimestamp(
        props.modelValue.cleaningHistoryEndedAtDate,
        timeObject
      );
    }
  }
);
</script>

<template>
  <b-row>
    <b-col>
      <b-row class="my-2">
        <!-- <b-col md="6" class="my-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="cleaningHistoryStartedAt"
                    class="form-label min-w-125px d-block col-12 col-auto"
                    >วันที่-เวลา เริ่มต้น
                  </label>

                  <date-picker
                    id="cleaningHistoryStartedAt"
                    v-model="form.cleaningHistoryStartedAt"
                    class="form-control p-0 border-0"
                    :disabled="submitting"
                    locale="th"
                    utc
                    :clearable="false"
                  />
                </div>
              </b-col> -->

        <b-col sm="12" md="6">
          <b-row>
            <b-col sm="6" class="my-2">
              <div class="input-group align-items-baseline">
                <label
                  for="cleaningHistoryStartedAtDate"
                  class="form-label min-w-125px d-block col-12 col-auto"
                  >วันที่เริ่มต้น
                </label>

                <date-picker
                  id="cleaningHistoryStartedAtDate"
                  v-model="formCleaningHistoryStartedAtDate"
                  class="form-control p-0 border-0"
                  :disabled="disabled"
                  auto-apply
                  :enable-time-picker="false"
                  locale="th"
                  utc
                  :clearable="false"
                />
              </div>
            </b-col>

            <b-col sm="6" class="my-2">
              <div class="input-group align-items-baseline">
                <label
                  for="cleaningHistoryStartedAtTime"
                  class="form-label min-w-125px d-block col-12 col-auto"
                  >เวลาเริ่มต้น
                </label>

                <date-picker
                  id="cleaningHistoryStartedAtTime"
                  v-model="modelValue.cleaningHistoryStartedAtTime"
                  class="form-control p-0 border-0"
                  :disabled="disabled"
                  cancel-text="ยกเลิก"
                  select-text="ยืนยัน"
                  time-picker
                  :clearable="false"
                />

                <b-form-invalid-feedback
                  :state="
                    isFormInvalid('cleaningHistoryStartedAtTime', ['required'])
                  "
                >
                  กรุณาเลือกเวลาเริ่มต้น
                </b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>

          <b-form-invalid-feedback
            :state="
              isFormInvalid('cleaningHistoryStartedAt', ['dateLesserThan'])
            "
          >
            กรุณาเลือกวันที่และเวลาเริ่มต้น ก่อนวันที่และเวลาสิ้นสุด
          </b-form-invalid-feedback>
        </b-col>

        <!-- <b-col md="6" class="my-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="cleaningHistoryEndedAt"
                    class="form-label min-w-125px d-block col-12 col-auto"
                    >วันที่-เวลา สิ้นสุด
                  </label>

                  <date-picker
                    id="cleaningHistoryEndedAt"
                    v-model="form.cleaningHistoryEndedAt"
                    class="form-control p-0 border-0"
                    :disabled="submitting"
                    locale="th"
                    utc
                    :clearable="false"
                  />
                </div>
              </b-col> -->

        <b-col sm="12" md="6">
          <b-row>
            <b-col sm="6" class="my-2">
              <div class="input-group align-items-baseline">
                <label
                  for="cleaningHistoryEndedAtDate"
                  class="form-label min-w-125px d-block col-12 col-auto"
                  >วันที่สิ้นสุด
                </label>

                <date-picker
                  id="cleaningHistoryEndedAtDate"
                  v-model="formCleaningHistoryEndedAtDate"
                  class="form-control p-0 border-0"
                  :disabled="disabled"
                  :enable-time-picker="false"
                  auto-apply
                  locale="th"
                  utc
                  :clearable="false"
                />
              </div>
            </b-col>

            <b-col sm="6" class="my-2">
              <div class="input-group align-items-baseline">
                <label
                  for="cleaningHistoryEndedAtTime"
                  class="form-label min-w-125px d-block col-12 col-auto"
                  >เวลาสิ้นสุด
                </label>

                <date-picker
                  id="cleaningHistoryEndedAtTime"
                  v-model="modelValue.cleaningHistoryEndedAtTime"
                  class="form-control p-0 border-0"
                  :disabled="disabled"
                  cancel-text="ยกเลิก"
                  select-text="ยืนยัน"
                  time-picker
                  :clearable="false"
                />

                <b-form-invalid-feedback
                  :state="
                    isFormInvalid('cleaningHistoryEndedAtTime', ['required'])
                  "
                >
                  กรุณาเลือกเวลาสิ้นสุด
                </b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>

          <!-- <b-form-invalid-feedback
                  :state="
                    isFormInvalid('cleaningHistoryEndedAt', ['dateGreaterThan'])
                  "
                >
                  กรุณาเลือกวันที่และเวลาสิ้นสุดหลังวันที่และเวลาเริ่มต้น
                </b-form-invalid-feedback> -->
        </b-col>
      </b-row>

      <b-row class="my-2">
        <b-col>
          <div class="input-group align-items-baseline">
            <div class="form-control p-0 border-0">
              <cleaning-program-select
                id="cleaningProgram"
                v-model="modelValue.cleaningProgram"
                :disabled="disabled"
                required
              />
            </div>
          </div>
        </b-col>
        <b-col>
          <div class="input-group align-items-baseline">
            <div class="form-control p-0 border-0">
              <cleaning-type-select
                id="cleaningType"
                v-model="modelValue.cleaningType"
                :disabled="disabled"
                required
              />
            </div>
          </div>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>
