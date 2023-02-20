<script lang="ts" setup>
import { ComputedRef, ReactiveEffect, ref } from "vue";
import { kebabCase } from "lodash";
import { useToast } from "vue-toastification";
import { required } from "@vuelidate/validators";
import DatePicker from "@vuepic/vue-datepicker";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import CleaningHistory from "~~/models/CleaningHistory";
import { UpdateCleaningHistoryForm } from "~~/composables/useCleaning";

definePageMeta({
  title: "Ai4FoodSafety - Update Swab Area History Page",

  middleware: ["auth"],

  canGoBack: true,
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const {
  onlyDate,
  onlyTime,
  toTimestamp,
  today,
  timeStringToTimePicker,
  formatThLocale,
} = useDate();

// const { getFacilityById } = useFacility();

// const {
//   api: swabApi,
//   getSwabAreaById,
//   getSwabAreaHistoryById,
//   getSwabTestById,
//   getSwabPeriodById,
//   getSwabAreaHistoryImagesByIds,
//   getSwabEnvironmentBySwabAreaHistoryId,
// } = useSwab();
const { getSwabAreaHistoryById, getSwabAreaById } = useSwab();
const { getCleaningHistoryById, api: cleaningApi } = useCleaning();
const id = ref(route.params.id as string);

const invalid = ref(false);
const error = ref(false);
const loading = ref(false);
const submitting = ref(false);
// const facilityId = ref(null);
const cleaningHistory = ref(null);
const currentDate = today();
const form: UpdateCleaningHistoryForm = reactive({
  cleaningHistoryStartedAt: null,
  cleaningHistoryEndedAt: null,
  cleaningHistoryStartedAtDate: onlyDate(currentDate),
  cleaningHistoryStartedAtTime: null,
  cleaningHistoryEndedAtDate: onlyDate(currentDate),
  cleaningHistoryEndedAtTime: null,
  cleaningProgram: null,
  cleaningValidations: [],
  // product: null,
  // facilityItem: null,
});

const formCleaningHistoryStartedAtDate = computed({
  get: () => {
    return form.cleaningHistoryStartedAtDate;
  },

  set: (date) => {
    console.log(date);

    form.cleaningHistoryStartedAtDate = onlyDate(date);

    console.log(form.cleaningHistoryStartedAtTime);

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
    console.log(date);

    form.cleaningHistoryEndedAtDate = onlyDate(date);

    if (form.cleaningHistoryEndedAtTime) {
      form.cleaningHistoryEndedAt = toTimestamp(
        form.cleaningHistoryEndedAtDate,
        form.cleaningHistoryEndedAtTime
      );
    }
  },
});

const validationRules = {
  cleaningHistoryStartedAtTime: {
    required,
    $lazy: true,
  },
  cleaningHistoryEndedAtTime: {
    required,
    $lazy: true,
  },
};

const { validate, isInvalid, isFormInvalid } = useValidation(
  validationRules,
  form
);

const title = computed(() => {
  let title = "Title";

  return title;
});

const swabAreaHistory = computed(() =>
  cleaningHistory.value
    ? getSwabAreaHistoryById(cleaningHistory.value.id)
    : null
);

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

const init = async function init() {
  error.value = false;

  loading.value = true;

  try {
    const cleaningHistory: CleaningHistory =
      await cleaningApi().loadCleaningHistoryById(id.value);

    console.log(cleaningHistory);

    if (cleaningHistory) {
      cleaningHistory.value = cleaningHistory;
      // swabAreaId.value = cleaningHistory.swabAreaId;
      // swabTestId.value = cleaningHistory.swabTestId;
      // swabPeriodId.value = cleaningHistory.swabPeriodId;

      // if (cleaningHistory.swabAreaSwabedAt) {
      //   form.swabAreaSwabedAt = timeStringToTimePicker(
      //     cleaningHistory.swabAreaSwabedAt
      //   );
      // }

      // if (cleaningHistory.facilityItemId) {
      //   form.facilityItem = {
      //     id: cleaningHistory.facilityItemId,
      //   };
      // }
    }
  } catch (e) {
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

  await updateSwabPlan();
};

const updateSwabPlan = async () => {
  submitting.value = true;

  try {
    // await cleaningApi().updateSwabPlanById(swabAreaHistoryId.value, form);

    toast.success("อัพเดตข้อมูลการทำความสะอาดสำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      router.back();
    }, 1000);
  } catch (error) {
    toast.error("อัพเดตข้อมูลการทำความสะอาดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  } finally {
    submitting.value = false;
  }
};

watch(
  () => form.cleaningHistoryStartedAtTime,
  (timeObject) => {
    console.log(timeObject);
    if (form.cleaningHistoryStartedAtDate) {
      form.cleaningHistoryStartedAt = toTimestamp(
        form.cleaningHistoryStartedAtDate,
        form.cleaningHistoryStartedAtTime
      );
    }
  }
);

watch(
  () => form.cleaningHistoryEndedAtTime,
  (timeObject) => {
    console.log(timeObject);
    if (form.cleaningHistoryEndedAtDate) {
      form.cleaningHistoryEndedAt = toTimestamp(
        form.cleaningHistoryEndedAtDate,
        form.cleaningHistoryEndedAtTime
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
      <b-form id="formUpdateSwabAreaHistory" @submit="onSubmit">
        <b-row v-if="cleaningHistory">
          <pre>{{ cleaningHistory }}</pre>
          <b-col
            cols="12"
            class="d-flex justify-content-between align-items-center"
          >
            <h5>
              <icon-complete
                :active="cleaningHistory.isCompleted"
              ></icon-complete>

              <b>{{ title }} : </b>

              <!-- <span>{{ swabArea.swabAreaName }}</span> -->
            </h5>

            <badge-complete-status
              class="position-absolute end-0 me-2"
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
        </b-row>

        <b-row class="mt-2">
          <div class="d-grid gap-2">
            <!-- <div v-if="swabAreaHistory" class="text__swab-area-date">
              <b>วันที่ : </b>{{ swabAreaDate }}
            </div>

            <div v-if="swabPeriod" class="text__swab-period-name">
              <b>ช่วงตรวจ : </b>{{ swabPeriod.swabPeriodName }}
            </div>

            <div v-if="facility" class="text__facility-name">
              <b>เครื่่อง : </b>{{ facility.facilityName }}
            </div>

            <div v-if="swabArea" class="text__swab-area-name">
              <b>จุดตรวจ : </b>{{ swabArea.swabAreaName }}
            </div> -->
          </div>
        </b-row>

        <b-row class="mt-3">
          <b-col>
            <h6 class="fw-bold">ข้อมูลเวลาทำความสะอาด:</h6>

            <b-row class="px-3">
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

              <b-col sm="6" md="3" class="my-2">
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

              <b-col sm="6" md="3" class="my-2">
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
                      isFormInvalid('cleaningHistoryEndedAtTime', ['required'])
                    "
                  >
                    กรุณาเลือกเวลาสิ้นสุด
                  </b-form-invalid-feedback>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row class="mt-3">
          <b-col>
            <h6 class="fw-bold">ข้อมูลโปรแกรมทำความสะอาด:</h6>
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
