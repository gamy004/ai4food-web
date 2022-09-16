<script lang="ts" setup>
import { useToast } from "vue-toastification";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import SwabAreaHistory from "~~/models/SwabAreaHistory";

definePageMeta({
  title: "Ai4FoodSafety - Update Swab Test Page",

  middleware: [
    "auth"
  ],

  canGoBack: true
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { formatThLocale } = useDate();
const { getFacilityById } = useFacility();
const {
  api: swabApi,
  getSwabAreaById,
  getSwabAreaHistoryById,
  getSwabTestById,
  getSwabPeriodById,
} = useSwab();
const swabAreaHistoryId = ref(route.query.id as string);
const areaTitle: string = route.query.areaTitle as string;
const areaName = ref(route.params.areaName as string);
const invalid = ref(false);
const error = ref(false);
const loading = ref(false);
const submitting = ref(false);
// const facilityId = ref(null);
const swabAreaId = ref(null);
const swabTestId = ref(null);
const swabPeriodId = ref(null);

const form = reactive({
  listeriaMonoDetected: null
});

const validationRules = {
  listeriaMonoDetected: { required, $lazy: true }
};

const v$ = useVuelidate(validationRules, form);

const isInvalid = (field, rules = []) => {
  return invalid.value ? !rules.some(rule => v$.value[field][rule].$invalid) : null;
};

const title = computed(() => {
  let title = "";

  if (areaTitle) {
    title += `${areaTitle}`;
  }

  if (areaName.value) {
    title += title.length
      ? ` : ${areaName.value}`
      : areaName.value;
  }

  return title;
});

const swabAreaHistory = computed(() => getSwabAreaHistoryById(swabAreaHistoryId.value));

const swabAreaDate = computed(() => formatThLocale(new Date(swabAreaHistory.value.swabAreaDate)));

const swabArea = computed(() => getSwabAreaById(swabAreaId.value));

const facility = computed(() => swabArea.value ? getFacilityById(swabArea.value.facilityId) : null);

const swabTest = computed(() => getSwabTestById(swabTestId.value));

const swabPeriod = computed(() => getSwabPeriodById(swabPeriodId.value));

const swabTestResultOptions = [
  { value: true, text: "พบเชื้อ Listeria" },
  { value: false, text: "ไม่พบเชื้อ Listeria" }
];

const checkMarkClassName = computed(() => ({
  "text-secondary": !swabAreaHistory.value.isCompleted,
  "text-success": swabAreaHistory.value.isCompleted
}));

const badgeVariant = computed(() => swabAreaHistory.value.isCompleted ? "success" : "light");

const badgeText = computed(() => swabAreaHistory.value.isCompleted ? "บันทึกสำเร็จ" : "บันทึกไม่สำเร็จ");

const init = async function init() {
  error.value = false;

  loading.value = true;

  try {
    const swabAreaHistoryData: SwabAreaHistory = await swabApi().loadSwabPlanForUpdateById(
      swabAreaHistoryId.value
    );

    if (swabAreaHistoryData) {
      swabAreaHistoryId.value = swabAreaHistoryData.id;
      swabAreaId.value = swabAreaHistoryData.swabAreaId;
      swabTestId.value = swabAreaHistoryData.swabTestId;
      swabPeriodId.value = swabAreaHistoryData.swabPeriodId;
    }
  } catch (e) {
    error.value = true;

    toast.error("โหลดข้อมูลจุดตรวจ swab สำหรับอัพเดตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { timeout: 1000 });
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  invalid.value = false;

  v$.value.$touch();

  if (v$.value.$invalid) {
    invalid.value = true;

    return toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  try {
    await swabApi().updateSwabTestById(swabTestId.value, {
      listeriaMonoDetected: form.listeriaMonoDetected
    });

    toast.success("อัพเดตข้อมูลจุด swab สำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      router.back();
    }, 1000);
  } catch (error) {
    toast.error("อัพเดตข้อมูลจุดตรวจ swab ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await init();
});
</script>

<template>
  <div class="page__update-plan mt-4">
    <h2 class="font-weight-bold text-center">
      อัพเดทผลการตรวจ swab test
    </h2>

    <b-col v-if="loading" class="text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </b-col>

    <div v-else class="d-grid gap-2 mt-3">
      <b-form id="formUpdateSwabAreaHistory" @submit="onSubmit">
        <b-row v-if="swabArea">
          <b-col cols="12" class="d-flex justify-content-between align-items-center">
            <h5>
              <carbon-checkmark-filled :style="{ fontSize: '1em', marginRight: '1rem' }" :class="checkMarkClassName" />

              <b>{{ title }} : </b>

              {{ swabTest.swabTestCode }}
            </h5>

            <b-badge :variant="badgeVariant" pill>
              {{ badgeText }}
            </b-badge>
          </b-col>

          <!-- <b-col cols="12" v-if="swabAreaHistory" class="mt-2">
                        {{ swabAreaHistory.swabAreaSwabedAt ? `อัพเดตล่าสุด:
                                                ${swabAreaHistory.swabAreaSwabedAt}` : ''
                        }}
                    </b-col> -->
        </b-row>

        <b-row class="mt-2">
          <div class="d-grid gap-2">
            <div v-if="swabAreaHistory" class="text__swab-area-date">
              <b>วันที่ : </b>{{
                  swabAreaDate
              }}
            </div>

            <div v-if="swabPeriod" class="text__swab-period-name">
              <b>ช่วงตรวจ : </b>{{
                  swabPeriod.swabPeriodName
              }}
            </div>

            <div v-if="facility" class="text__facility-name">
              <b>เครื่่อง : </b>{{
                  facility.facilityName
              }}
            </div>

            <div v-if="swabArea" class="text__swab-area-name">
              <b>จุดตรวจ : </b>{{
                  swabArea.swabAreaName
              }}
            </div>
          </div>
        </b-row>

        <b-row class="mt-3">
          <b-col>
            <h6 class="fw-bold">
              ข้อมูลผลตรวจ :
            </h6>

            <b-row class="px-3">
              <b-col v-if="swabArea" md="8" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label for="swabAreaSwabedAt" class="form-label min-w-125px d-block col-12 col-md-auto">ผลการตรวจเชื้อ
                  </label>

                  <div class="form-control p-0 border-0">
                    <b-form-select id="listeriaResult" v-model="form.listeriaMonoDetected" :disabled="submitting"
                      :options="swabTestResultOptions" />

                    <b-form-invalid-feedback :state="isInvalid('listeriaResult', ['required'])">
                      กรุณาเลือกผลการตรวจเชื้อ
                    </b-form-invalid-feedback>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row align-h="center" class="my-4">
          <b-col cols="auto">
            <b-button variant="outline-primary" size="lg" :disabled="submitting" @click="router.back">
              ยกเลิก
            </b-button>
          </b-col>

          <b-col cols="auto">
            <button-arrow-right variant="primary" size="lg" :loading="submitting" type="submit">
              บันทึก
            </button-arrow-right>
          </b-col>
        </b-row>
      </b-form>
    </div>

    <b-col v-if="error" class="text-center mt-3">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลจุดตรวจ swab {{ title }}</p>

      <b-button variant="dark" @click="init">
        โหลดข้อมูลใหม่
      </b-button>
    </b-col>
  </div>
</template>
