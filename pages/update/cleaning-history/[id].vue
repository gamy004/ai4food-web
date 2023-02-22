<script lang="ts" setup>
import { ComputedRef, ReactiveEffect, ref } from "vue";
import { kebabCase } from "lodash";
import { useToast } from "vue-toastification";
import { minValue, required } from "@vuelidate/validators";
import DatePicker from "@vuepic/vue-datepicker";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import CleaningHistory from "~~/models/CleaningHistory";
import { UpdateCleaningHistoryBody } from "~~/composables/useCleaning";

definePageMeta({
  title: "Ai4FoodSafety - Update Swab Area History Page",

  middleware: ["auth"],

  canGoBack: true,
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { onlyDate, onlyTime, toTimestamp, today, timeStringToTimePicker } =
  useDate();
const { dateGreaterThan } = useValidationRule();

const {
  getSwabAreaHistoryById,
  getSwabPeriodById,
  getSwabAreaById,
  getSwabTestById,
} = useSwab();
const { getFacilityById, getFacilityItemById } = useFacility();
const { getCleaningHistoryById, api: cleaningApi } = useCleaning();
const id = ref(route.params.id as string);

const invalid = ref(false);
const error = ref(false);
const loading = ref(false);
const submitting = ref(false);
const cleaningHistoryId = ref<string | null>(null);
const currentDate = today();
const form = reactive<UpdateCleaningHistoryBody>({
  cleaningHistoryStartedAt: null,
  cleaningHistoryEndedAt: null,
  cleaningHistoryStartedAtDate: onlyDate(currentDate),
  cleaningHistoryStartedAtTime: null,
  cleaningHistoryEndedAtDate: onlyDate(currentDate),
  cleaningHistoryEndedAtTime: null,
  cleaningProgram: null,
  cleaningValidations: [],
});

const formCleaningHistoryStartedAtDate = computed({
  get: () => {
    return form.cleaningHistoryStartedAtDate;
  },

  set: (date) => {
    form.cleaningHistoryStartedAtDate = onlyDate(date);

    if (form.cleaningHistoryStartedAtTime) {
      form.cleaningHistoryStartedAt = toTimestamp(
        form.cleaningHistoryStartedAtDate,
        form.cleaningHistoryStartedAtTime
      );
    }
  },
});

const formCleaningHistoryEndedAtDate = computed({
  get: () => {
    return form.cleaningHistoryEndedAtDate;
  },

  set: (date) => {
    form.cleaningHistoryEndedAtDate = onlyDate(date);

    if (form.cleaningHistoryEndedAtTime) {
      form.cleaningHistoryEndedAt = toTimestamp(
        form.cleaningHistoryEndedAtDate,
        form.cleaningHistoryEndedAtTime
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
  cleaningHistoryEndedAt: {
    dateGreaterThan: dateGreaterThan(form.cleaningHistoryStartedAt),
    $lazy: true,
  },
}));

const { validate, isInvalid, isFormInvalid } = useValidation(
  validationRules,
  form
);

const cleaningHistory = computed(() =>
  cleaningHistoryId.value
    ? getCleaningHistoryById(cleaningHistoryId.value)
    : null
);

const swabAreaHistory = computed(() =>
  cleaningHistory.value
    ? getSwabAreaHistoryById(cleaningHistory.value.swabAreaHistoryId)
    : null
);

const swabPeriod = computed(() =>
  swabAreaHistory.value
    ? getSwabPeriodById(swabAreaHistory.value.swabPeriodId)
    : null
);

const swabArea = computed(() =>
  swabAreaHistory.value
    ? getSwabAreaById(swabAreaHistory.value.swabAreaId)
    : null
);

const swabTest = computed(() =>
  swabAreaHistory.value
    ? getSwabTestById(swabAreaHistory.value.swabTestId)
    : null
);

const facilityItem = computed(() =>
  swabAreaHistory.value
    ? getFacilityItemById(swabAreaHistory.value.facilityItemId)
    : null
);

const facility = computed(() =>
  swabArea.value ? getFacilityById(swabArea.value.facilityId) : null
);

const title = computed(() => {
  let title = "";

  if (swabTest) {
    title += `${swabTest.value.swabTestCode}`;
  }

  return title;
});

// const swabAreaDate = computed(() =>
//   formatThLocale(new Date(swabAreaHistory.value.swabAreaDate))
// );

// const swabArea = computed(() => getSwabAreaById(swabAreaId.value));

// const facility = computed(() =>
//   swabArea.value ? getFacilityById(swabArea.value.facilityId) : null
// );

// const swabTest = computed(() => getSwabTestById(swabTestId.value));

// const swabPeriod = computed(() => getSwabPeriodById(swabPeriodId.value));

// const checkMarkClassName = computed(() => ({
//   "text-secondary": !cleaningHistory.value.isCompleted,
//   "text-success": cleaningHistory.value.isCompleted,
// }));

// const badgeVariant = computed(() =>
//   swabAreaHistory.value.isCompleted ? "success" : "light"
// );

// const badgeText = computed(() =>
//   swabAreaHistory.value.isCompleted ? "บันทึกสำเร็จ" : "บันทึกไม่สำเร็จ"
// );

const init = async () => {
  error.value = false;

  loading.value = true;

  try {
    const entity: CleaningHistory = await cleaningApi().loadCleaningHistoryById(
      id.value
    );

    console.log(entity);

    if (entity) {
      cleaningHistoryId.value = Object.freeze(entity.id);

      if (entity.cleaningHistoryStartedAt) {
        form.cleaningHistoryStartedAtDate = onlyDate(
          entity.cleaningHistoryStartedAt
        );

        form.cleaningHistoryStartedAtTime = timeStringToTimePicker(
          onlyTime(entity.cleaningHistoryStartedAt)
        );
      }

      if (entity.cleaningHistoryEndedAt) {
        form.cleaningHistoryEndedAtDate = onlyDate(
          entity.cleaningHistoryEndedAt
        );

        form.cleaningHistoryEndedAtTime = timeStringToTimePicker(
          onlyTime(entity.cleaningHistoryEndedAt)
        );
      }

      if (entity.cleaningProgramId) {
        form.cleaningProgram = {
          id: entity.cleaningProgramId,
        };
      }
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error("โหลดข้อมูลการทำความสะอาดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  invalid.value = false;

  validate();

  if (isInvalid.value) {
    toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");

    return;
  }

  await submit();
};

const submit = async () => {
  submitting.value = true;

  try {
    console.log(cleaningHistory.value);

    await cleaningApi().updateCleaningHistory(id.value, form);

    toast.success("อัพเดตข้อมูลการทำความสะอาดสำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      router.back();
    }, 1000);
  } catch (error) {
    console.log(error);

    toast.error("อัพเดตข้อมูลการทำความสะอาดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  } finally {
    submitting.value = false;
  }
};

watch(
  () => form.cleaningHistoryStartedAtTime,
  (timeObject) => {
    if (form.cleaningHistoryStartedAtDate) {
      form.cleaningHistoryStartedAt = toTimestamp(
        form.cleaningHistoryStartedAtDate,
        timeObject
      );
    }
  }
);

watch(
  () => form.cleaningHistoryEndedAtTime,
  (timeObject) => {
    if (form.cleaningHistoryEndedAtDate) {
      form.cleaningHistoryEndedAt = toTimestamp(
        form.cleaningHistoryEndedAtDate,
        timeObject
      );
    }
  }
);

onMounted(async () => {
  await init();
});
</script>

<template>
  <div class="page__swab-area--update mt-4">
    <h2 class="font-weight-bold text-center">บันทึกการทำความสะอาด</h2>

    <b-col v-if="loading" class="text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </b-col>

    <div v-else class="d-grid gap-2 mt-3">
      <b-form id="formUpdateCleaningHistory" @submit="onSubmit">
        <b-row v-if="cleaningHistory">
          <b-col
            cols="12"
            class="d-flex justify-content-between align-items-center"
          >
            <h5>
              <icon-complete
                :active="cleaningHistory.isCompleted"
              ></icon-complete>

              <b>{{ title }} : </b>

              <span v-if="swabArea">{{ swabArea.swabAreaName }}</span>
            </h5>

            <badge-complete-status
              class="me-2"
              :is-completed="cleaningHistory.isCompleted"
            ></badge-complete-status>

            <!-- <b-badge :variant="badgeVariant" pill>
              {{ badgeText }}
            </b-badge> -->
          </b-col>

          <!-- <b-col cols="12" v-if="swabAreaHistory" class="mt-2">
                        {{ swabAreaHistory.swabAreaSwabedAt ? `อัพเดตล่าสุด:
                                                ${swabAreaHistory.swabAreaSwabedAt}` : ''
                        }}
                    </b-col> -->
          <b-col cols="12">
            <div class="d-grid gap-2">
              <div v-if="swabAreaHistory" class="text__swab-area-date">
                <b>วันที่ : </b>{{ swabAreaHistory.readableSwabAreaDate }}
              </div>

              <div v-if="swabPeriod" class="text__swab-period-name">
                <b>ช่วงตรวจ : </b>{{ swabPeriod.swabPeriodName }}
              </div>

              <div v-if="facility" class="text__facility-name">
                <b>เครื่่อง : </b>{{ facility.facilityName }}
              </div>

              <div v-if="swabArea" class="text__swab-area-name">
                <b>จุดตรวจ : </b>{{ swabArea.swabAreaName }}
              </div>

              <div v-if="facilityItem" class="text__facility-item-name">
                <b>ไลน์ : </b>{{ facilityItem.facilityItemName }}
              </div>
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col>
            <h6 class="fw-bold">ข้อมูลการทำความสะอาด:</h6>

            <b-row>
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

              <b-col sm="6" md="3" class="my-2">
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
                    :disabled="submitting"
                    auto-apply
                    :enable-time-picker="false"
                    locale="th"
                    utc
                    :clearable="false"
                  />
                </div>
              </b-col>

              <b-col sm="6" md="3" class="my-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="cleaningHistoryStartedAtTime"
                    class="form-label min-w-125px d-block col-12 col-auto"
                    >เวลาเริ่มต้น
                  </label>

                  <date-picker
                    id="cleaningHistoryStartedAtTime"
                    v-model="form.cleaningHistoryStartedAtTime"
                    class="form-control p-0 border-0"
                    :disabled="submitting"
                    cancel-text="ยกเลิก"
                    select-text="ยืนยัน"
                    time-picker
                    :clearable="false"
                  />

                  <b-form-invalid-feedback
                    :state="
                      isFormInvalid('cleaningHistoryStartedAtTime', [
                        'required',
                      ])
                    "
                  >
                    กรุณาเลือกเวลาเริ่มต้น
                  </b-form-invalid-feedback>
                </div>
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
                        :disabled="submitting"
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
                        v-model="form.cleaningHistoryEndedAtTime"
                        class="form-control p-0 border-0"
                        :disabled="submitting"
                        cancel-text="ยกเลิก"
                        select-text="ยืนยัน"
                        time-picker
                        :clearable="false"
                      />

                      <b-form-invalid-feedback
                        :state="
                          isFormInvalid('cleaningHistoryEndedAtTime', [
                            'required',
                          ])
                        "
                      >
                        กรุณาเลือกเวลาสิ้นสุด
                      </b-form-invalid-feedback>
                    </div>
                  </b-col>
                </b-row>

                <b-form-invalid-feedback
                  :state="
                    isFormInvalid('cleaningHistoryEndedAt', ['dateGreaterThan'])
                  "
                >
                  กรุณาเลือกวันที่และเวลาสิ้นสุดหลังวันที่และเวลาเริ่มต้น
                </b-form-invalid-feedback>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <div class="input-group align-items-baseline">
                  <div class="form-control p-0 border-0">
                    <cleaning-program-select
                      id="cleaningProgram"
                      v-model="form.cleaningProgram"
                      :disabled="submitting"
                      required
                    />
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <!-- <b-row class="mt-4">
          <b-col>
            <h6 class="fw-bold" for="swabAreaNote">
              หมายเหตุ : <span class="text-secondary">(Optional)</span>
            </h6>

            <b-row class="px-3">
              <b-col>
                <b-form-textarea
                  id="swabAreaNote"
                  v-model="form.swabAreaNote"
                  :disabled="submitting"
                  rows="3"
                  max-rows="3"
                  no-resize
                />
              </b-col>
            </b-row>
          </b-col>
        </b-row> -->

        <b-row class="mt-3">
          <b-col>
            <h6 class="fw-bold">รายการตรวจสอบ:</h6>
          </b-col>
        </b-row>

        <b-row align-h="center" class="my-4">
          <b-col cols="auto">
            <b-button
              variant="outline-primary"
              size="lg"
              :disabled="submitting"
              @click="router.back"
            >
              ยกเลิก
            </b-button>
          </b-col>

          <b-col cols="auto">
            <button-arrow-right
              variant="primary"
              size="lg"
              :loading="submitting"
              type="submit"
            >
              บันทึก
            </button-arrow-right>
          </b-col>
        </b-row>
      </b-form>
    </div>

    <b-col v-if="error" class="text-center mt-3">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลจุดตรวจ swab {{ title }}</p>

      <b-button variant="dark" @click="init"> โหลดข้อมูลใหม่ </b-button>
    </b-col>
  </div>
</template>

<style lang="scss" scoped>
// .input {
//   &__swab-area-date {
//     margin-left: 0.1rem !important;
//   }
// }
</style>
