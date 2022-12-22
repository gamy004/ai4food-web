<script lang="ts" setup>
import { kebabCase } from "lodash";
import { useToast } from "vue-toastification";
import { required, requiredIf } from "@vuelidate/validators";
import DatePicker from "@vuepic/vue-datepicker";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import SwabAreaHistory from "~~/models/SwabAreaHistory";

definePageMeta({
  title: "Ai4FoodSafety - Update Swab Area History Page",

  middleware: ["auth"],

  canGoBack: true,
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { onlyDate, today, timeStringToTimePicker, formatThLocale } = useDate();
const { getFacilityById } = useFacility();
const {
  api: swabApi,
  getSwabAreaById,
  getSwabAreaHistoryById,
  getSwabTestById,
  getSwabPeriodById,
  getSwabAreaHistoryImagesByIds,
  getSwabEnvironmentBySwabAreaHistoryId,
} = useSwab();
const swabAreaHistoryId = ref(route.query.id as string);
const areaTitle: string = route.query.areaTitle as string;
const areaName = ref(route.params.areaName as string);
const invalid = ref(false);
const showTemperatureWarning = ref(false);
const error = ref(false);
const loading = ref(false);
const submitting = ref(false);
// const facilityId = ref(null);
const swabAreaId = ref(null);
const swabTestId = ref(null);
const swabPeriodId = ref(null);
const imageBrowserRef = ref(null);
const TEMPERATURE_THRESHOLD = 50;
const currentDate = today();
const form = reactive({
  swabAreaSwabedAt: {
    hours: currentDate.getHours(),
    minutes: currentDate.getMinutes(),
    seconds: 0,
  },
  swabAreaTemperature: null,
  swabAreaHumidity: null,
  swabAreaNote: null,
  productLot: null,
  productDate: onlyDate(currentDate),
  product: null,
  facilityItem: null,
  swabAreaHistoryImages: [],
  swabEnvironments: [],
});

const haveSomeImages = (value) =>
  swabArea.value.shouldRecordImage
    ? value?.length > 0 || imageBrowserRef.value?.hasPendingUploadImages
    : true;

const validationRules = {
  swabAreaSwabedAt: {
    // required,
    requiredIfMainArea: requiredIf(() => swabArea.value.isMainArea),
    $lazy: true,
  },
  facilityItem: {
    // required,
    requiredIfMainArea: requiredIf(() => swabArea.value.isMainArea),
    $lazy: true,
  },
  productLot: {
    requiredIfShouldRecordProduct: requiredIf(
      () => swabArea.value.shouldRecordProduct
    ),
    $lazy: true,
  },
  productDate: {
    requiredIfShouldRecordProduct: requiredIf(
      () => swabArea.value.shouldRecordProduct
    ),
    $lazy: true,
  },
  product: {
    requiredIfShouldRecordProduct: requiredIf(
      () => swabArea.value.shouldRecordProduct
    ),
    $lazy: true,
  },
  swabAreaHistoryImages: { haveSomeImages, $lazy: true },
  swabAreaTemperature: {
    requiredIfShouldRecordEnvironment: requiredIf(
      () => swabArea.value.shouldRecordEnvironment
    ),
    $lazy: true,
  },
  swabAreaHumidity: {
    requiredIfShouldRecordEnvironment: requiredIf(
      () => swabArea.value.shouldRecordEnvironment
    ),
    $lazy: true,
  },
  swabEnvironments: {
    requiredIfShouldRecordEnvironment: requiredIf(
      () => swabArea.value.shouldRecordEnvironment
    ),
    $lazy: true,
  },
};

const { validate, isInvalid, isFormInvalid } = useValidation(
  validationRules,
  form
);
// const v$ = useVuelidate(validationRules, form);

const swabProductFormInvalidState = computed(() => ({
  productLot: isFormInvalid("productLot", ["requiredIfShouldRecordProduct"]),
  productDate: isFormInvalid("productDate", ["requiredIfShouldRecordProduct"]),
  product: isFormInvalid("product", ["requiredIfShouldRecordProduct"]),
}));

const swabEnvironmentFormInvalidState = computed(() => ({
  swabAreaTemperature: isFormInvalid("swabAreaTemperature", [
    "requiredIfShouldRecordEnvironment",
  ]),
  swabAreaHumidity: isFormInvalid("swabAreaHumidity", [
    "requiredIfShouldRecordEnvironment",
  ]),
  swabEnvironments: isFormInvalid("swabEnvironments", [
    "requiredIfShouldRecordEnvironment",
  ]),
}));

const title = computed(() => {
  let title = "";

  if (areaTitle) {
    title += `${areaTitle}`;
  }

  if (areaName.value) {
    title += title.length ? ` : ${areaName.value}` : areaName.value;
  }

  return title;
});

const swabAreaHistory = computed(() =>
  getSwabAreaHistoryById(swabAreaHistoryId.value)
);

const swabAreaDate = computed(() =>
  formatThLocale(new Date(swabAreaHistory.value.swabAreaDate))
);

const swabArea = computed(() => getSwabAreaById(swabAreaId.value));

const facility = computed(() =>
  swabArea.value ? getFacilityById(swabArea.value.facilityId) : null
);

const swabTest = computed(() => getSwabTestById(swabTestId.value));

const swabPeriod = computed(() => getSwabPeriodById(swabPeriodId.value));

const swabAreaHistoryImages = computed(() => {
  return getSwabAreaHistoryImagesByIds(
    form.swabAreaHistoryImages.map(({ id }) => id)
  );
});

const displayedImages = computed({
  get: () => {
    return swabAreaHistoryImages.value.map(({ id, file }) => ({
      id: file.id,
      src: file.fileSource,
      parentId: id,
    }));
  },
  set: (value) => {
    form.swabAreaHistoryImages = value.map(({ parentId }) => ({
      id: parentId,
    }));
  },
});

const checkMarkClassName = computed(() => ({
  "text-secondary": !swabAreaHistory.value.isCompleted,
  "text-success": swabAreaHistory.value.isCompleted,
}));

const badgeVariant = computed(() =>
  swabAreaHistory.value.isCompleted ? "success" : "light"
);

const badgeText = computed(() =>
  swabAreaHistory.value.isCompleted ? "บันทึกสำเร็จ" : "บันทึกไม่สำเร็จ"
);

const imageDirectory = computed(
  () => `swab-area-history-image/${kebabCase(swabTest.value?.swabTestCode)}`
);

const init = async function init() {
  error.value = false;

  loading.value = true;

  try {
    const swabAreaHistoryData: SwabAreaHistory =
      await swabApi().loadSwabPlanForUpdateById(swabAreaHistoryId.value);

    if (swabAreaHistoryData) {
      swabAreaHistoryId.value = swabAreaHistoryData.id;
      swabAreaId.value = swabAreaHistoryData.swabAreaId;
      swabTestId.value = swabAreaHistoryData.swabTestId;
      swabPeriodId.value = swabAreaHistoryData.swabPeriodId;

      if (swabAreaHistoryData.swabAreaSwabedAt) {
        form.swabAreaSwabedAt = timeStringToTimePicker(
          swabAreaHistoryData.swabAreaSwabedAt
        );
      }

      if (swabAreaHistoryData.facilityItemId) {
        form.facilityItem = {
          id: swabAreaHistoryData.facilityItemId,
        };
      }

      if (swabAreaHistoryData.swabAreaNote) {
        form.swabAreaNote = swabAreaHistoryData.swabAreaNote;
      }

      if (swabArea.value.shouldRecordProduct) {
        if (swabAreaHistoryData.productId) {
          form.product = {
            id: swabAreaHistoryData.productId,
          };
        }

        if (swabAreaHistoryData.productDate) {
          form.productDate = swabAreaHistoryData.productDate;
        }

        if (swabAreaHistoryData.productLot) {
          form.productLot = swabAreaHistoryData.productLot;
        }
      } else {
        form.productDate = null;
      }

      if (swabArea.value.shouldRecordImage) {
        if (swabAreaHistoryData.swabAreaHistoryImages) {
          form.swabAreaHistoryImages =
            swabAreaHistoryData.swabAreaHistoryImages.map(({ id }) => ({ id }));
        }
      }

      if (swabArea.value.shouldRecordEnvironment) {
        if (swabAreaHistoryData.swabAreaTemperature) {
          form.swabAreaTemperature = parseFloat(
            swabAreaHistoryData.swabAreaTemperature
          );
        }

        if (swabAreaHistoryData.swabAreaHumidity) {
          form.swabAreaHumidity = parseFloat(
            swabAreaHistoryData.swabAreaHumidity
          );
        }

        const relatedSwabEnvironments = getSwabEnvironmentBySwabAreaHistoryId(
          swabAreaHistoryData.id
        );

        if (relatedSwabEnvironments.length) {
          form.swabEnvironments = relatedSwabEnvironments.map(({ id }) => ({
            id,
          }));
        }
      }
    }
  } catch (e) {
    error.value = true;

    toast.error(
      "โหลดข้อมูลจุดตรวจ swab สำหรับอัพเดตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      { timeout: 1000 }
    );
  } finally {
    loading.value = false;
  }
};

const validateTemperature = () => {
  const isTemperatureHighThanUsual =
    form.swabAreaTemperature &&
    form.swabAreaTemperature >= TEMPERATURE_THRESHOLD;
  const isTemperatureHighThanHumidity =
    form.swabAreaTemperature &&
    form.swabAreaHumidity &&
    form.swabAreaTemperature > form.swabAreaHumidity;

  console.log(
    isTemperatureHighThanUsual,
    isTemperatureHighThanHumidity,
    isTemperatureHighThanUsual || isTemperatureHighThanHumidity
  );

  return isTemperatureHighThanUsual || isTemperatureHighThanHumidity;
};

const onSubmit = async () => {
  invalid.value = false;

  validate();

  if (isInvalid.value) {
    toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");

    return;
  }

  const isTemperatureInvalid = validateTemperature();

  if (isTemperatureInvalid) {
    showTemperatureWarning.value = true;

    return;
  }

  await updateSwabPlan();
};

const onTemeratureWarningComfirm = async () => {
  await updateSwabPlan();

  showTemperatureWarning.value = false;
};

const updateSwabPlan = async () => {
  submitting.value = true;

  try {
    if (imageBrowserRef.value?.hasPendingUploadImages) {
      const uploadedImages = await imageBrowserRef.value?.upload();

      if (uploadedImages.length) {
        uploadedImages.forEach((uploadedImage) => {
          form.swabAreaHistoryImages.push({ file: uploadedImage });
        });
      }
    }

    await swabApi().updateSwabPlanById(swabAreaHistoryId.value, form);

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
  <div class="page__swab-area--update mt-4">
    <h2 class="font-weight-bold text-center">บันทึกจุดตรวจ swab</h2>

    <b-col v-if="loading" class="text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </b-col>

    <div v-else class="d-grid gap-2 mt-3">
      <b-form id="formUpdateSwabAreaHistory" @submit="onSubmit">
        <b-row v-if="swabArea">
          <b-col
            cols="12"
            class="d-flex justify-content-between align-items-center"
          >
            <h5>
              <carbon-checkmark-filled
                :style="{ fontSize: '1em', marginRight: '1rem' }"
                :class="checkMarkClassName"
              />

              <b>{{ title }} : </b>

              {{ swabArea.swabAreaName }}
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
            </div>
          </div>
        </b-row>

        <b-row v-if="swabArea && swabArea.isMainArea" class="mt-3">
          <b-col>
            <h6 class="fw-bold">ข้อมูลจุดตรวจ :</h6>

            <b-row class="px-3">
              <b-col md="6" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="swabAreaSwabedAt"
                    class="form-label min-w-125px d-block col-12 col-md-auto"
                    >เวลาตรวจ
                  </label>

                  <date-picker
                    id="swabAreaSwabedAt"
                    v-model.number="form.swabAreaSwabedAt"
                    class="form-control p-0 border-0"
                    :disabled="submitting"
                    time-picker
                    auto-apply
                    :clearable="false"
                  />

                  <b-form-invalid-feedback
                    :state="
                      isFormInvalid('swabAreaSwabedAt', ['requiredIfMainArea'])
                    "
                  >
                    กรุณาเลือกเวลาที่บันทึก
                  </b-form-invalid-feedback>
                </div>
              </b-col>

              <b-col v-if="swabArea" md="6" class="mt-2">
                <div class="input-group align-items-baseline">
                  <label
                    for="facilityItem"
                    class="form-label min-w-125px d-block col-12 col-md-auto"
                    >ไลน์
                  </label>

                  <div class="form-control p-0 border-0">
                    <facility-item-select
                      id="facilityItem"
                      v-model="form.facilityItem"
                      :disabled="submitting"
                      :facility-id="swabArea.facilityId"
                    />

                    <b-form-invalid-feedback
                      :state="
                        isFormInvalid('facilityItem', ['requiredIfMainArea'])
                      "
                    >
                      กรุณาเลือกไลน์
                    </b-form-invalid-feedback>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row v-if="swabArea && swabArea.shouldRecordProduct" class="mt-4">
          <b-col>
            <h6 class="fw-bold">ข้อมูลสินค้าในไลน์ที่กำลังผลิต :</h6>

            <swab-product-form
              v-model="form"
              :disabled="submitting"
              :invalid-state="swabProductFormInvalidState"
              class="px-3"
            />
          </b-col>
        </b-row>

        <b-row v-if="swabArea && swabArea.shouldRecordEnvironment" class="mt-4">
          <b-col>
            <h6 class="fw-bold">ข้อมูลสภาพแวดล้อม :</h6>

            <swab-environment-form
              v-model="form"
              :disabled="submitting"
              :invalid-state="swabEnvironmentFormInvalidState"
              class="px-3"
            />
          </b-col>
        </b-row>

        <b-row v-if="swabArea && swabArea.shouldRecordImage" class="mt-4">
          <b-col>
            <h6 class="fw-bold">รูปภาพประกอบ :</h6>

            <b-row class="px-3">
              <b-col>
                <image-browser
                  ref="imageBrowserRef"
                  v-model="displayedImages"
                  :directory="imageDirectory"
                  :disabled="submitting"
                />

                <b-form-invalid-feedback
                  :state="
                    isFormInvalid('swabAreaHistoryImages', ['haveSomeImages'])
                  "
                >
                  กรุณาอัพโหลดรูปภาพประกอบ อย่างน้อย 1 รูป
                </b-form-invalid-feedback>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <b-row class="mt-4">
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

      <modal-warning
        title="ตรวจพบความผิดปกติของข้อมูลอุณหภูมิ"
        v-model:show-value="showTemperatureWarning"
        v-model:loading-value="submitting"
        @confirm="onTemeratureWarningComfirm"
      >
        <div>
          <p>
            ระบบพบว่าอุณหภูมิมีค่ามากกว่า {{ TEMPERATURE_THRESHOLD }}°C หรือ
            อุณหภูมิมีค่ามากกว่าความชื้น
          </p>

          <p>คุณแน่ใจว่าข้อมูลถูกต้องและต้องการบันทึกข้อมูลใช่ไหม</p>
        </div>
      </modal-warning>
    </div>

    <b-col v-if="error" class="text-center mt-3">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลจุดตรวจ swab {{ title }}</p>

      <b-button variant="dark" @click="init"> โหลดข้อมูลใหม่ </b-button>
    </b-col>
  </div>
</template>

<style lang="scss" scoped>
.input {
  &__swab-area-date {
    margin-left: 0.1rem !important;
  }
}
</style>
