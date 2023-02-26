<script lang="ts" setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import CleaningHistory from "~~/models/CleaningHistory";
import { UpsertCleaningHistoryValidationData } from "~~/composables/useCleaning";

definePageMeta({
  title: "Ai4FoodSafety - Update Cleaning History Page",

  middleware: ["auth"],

  canGoBack: true,
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { onlyDate, onlyTime, toTimestamp, today, timeStringToTimePicker } =
  useDate();

const {
  getSwabAreaHistoryById,
  getSwabPeriodById,
  getSwabAreaById,
  getSwabTestById,
} = useSwab();
const { getFacilityById, getFacilityItemById } = useFacility();
const { getCleaningHistoryById, api: cleaningApi } = useCleaning();
const { redirect } = useNavigation();
const id = ref(route.params.id as string);

const invalid = ref(false);
const error = ref(false);
const loading = ref(false);
const submitting = ref(false);
const currentDate = today();

const cleaningHistoryEndedAtDate = onlyDate(currentDate);
const cleaningHistoryEndedAtTime = timeStringToTimePicker(
  onlyTime(currentDate),
  false
);
const cleaningHistoryEndedAt = toTimestamp(
  cleaningHistoryEndedAtDate,
  cleaningHistoryEndedAtTime
);

const form = reactive({
  cleaningHistoryStartedAt: null,
  cleaningHistoryEndedAt,
  cleaningHistoryStartedAtDate: onlyDate(currentDate),
  cleaningHistoryStartedAtTime: null,
  cleaningHistoryEndedAtDate,
  cleaningHistoryEndedAtTime,
  cleaningProgram: null,
  cleaningType: null,
  cleaningHistoryValidations: [],
});

const { validate, isInvalid, resetValidation } = useValidation({}, form);

const cleaningHistory = computed(() => getCleaningHistoryById(id.value));

const isCompleted = computed(() =>
  cleaningHistory.value ? cleaningHistory.value.isCompleted : false
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

const init = async () => {
  error.value = false;

  loading.value = true;

  try {
    const entity: CleaningHistory = await cleaningApi().loadCleaningHistoryById(
      id.value
    );

    if (entity) {
      if (entity.cleaningHistoryStartedAt) {
        form.cleaningHistoryStartedAtDate = onlyDate(
          entity.cleaningHistoryStartedAt
        );

        form.cleaningHistoryStartedAtTime = timeStringToTimePicker(
          onlyTime(entity.cleaningHistoryStartedAt),
          false
        );

        form.cleaningHistoryStartedAt = toTimestamp(
          form.cleaningHistoryStartedAtDate,
          form.cleaningHistoryStartedAtTime
        );
      }

      if (entity.cleaningHistoryEndedAt) {
        form.cleaningHistoryEndedAtDate = onlyDate(
          entity.cleaningHistoryEndedAt
        );

        form.cleaningHistoryEndedAtTime = timeStringToTimePicker(
          onlyTime(entity.cleaningHistoryEndedAt),
          false
        );

        form.cleaningHistoryEndedAt = toTimestamp(
          form.cleaningHistoryEndedAtDate,
          form.cleaningHistoryEndedAtTime
        );
      }

      if (entity.cleaningProgramId) {
        form.cleaningProgram = {
          id: entity.cleaningProgramId,
        };
      }

      if (entity.cleaningType) {
        form.cleaningType = entity.cleaningType;
      }

      const { cleaningHistoryValidations = [], swabAreaHistory } = entity;

      const mapCleaningHistoryValidation = new Map();

      cleaningHistoryValidations.forEach((item) =>
        mapCleaningHistoryValidation.set(item.cleaningValidationId, item)
      );

      if (swabAreaHistory.swabPeriod) {
        let { cleaningValidations = [] } = swabAreaHistory.swabPeriod;

        cleaningValidations = cleaningValidations.filter((item) => item.active);

        form.cleaningHistoryValidations = cleaningValidations.map(
          (cleaningValidation) => {
            const entity: UpsertCleaningHistoryValidationData = {
              cleaningValidationId: cleaningValidation.id,
              pass: null,
            };

            const mapEntity = mapCleaningHistoryValidation.get(
              cleaningValidation.id
            );

            if (mapEntity) {
              entity.id = mapEntity.id;
              entity.pass = mapEntity.pass;
            }

            return entity;
          }
        );
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

  resetValidation();

  await submit();
};

const submit = async () => {
  submitting.value = true;

  try {
    await cleaningApi().updateCleaningHistory(id.value, form);

    toast.success("อัพเดตข้อมูลการทำความสะอาดสำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      redirect();
    }, 1000);
  } catch (error) {
    console.log(error);

    toast.error("อัพเดตข้อมูลการทำความสะอาดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
              <icon-complete :active="isCompleted"></icon-complete>

              <b>{{ title }} : </b>

              <span v-if="swabArea">{{ swabArea.swabAreaName }}</span>
            </h5>

            <badge-complete-status
              class="me-2"
              :is-completed="isCompleted"
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

        <b-row class="mt-3">
          <b-col>
            <h6 class="fw-bold">ข้อมูลการทำความสะอาด:</h6>

            <form-cleaning-history v-model="form"></form-cleaning-history>
          </b-col>
        </b-row>

        <b-row class="mt-3">
          <b-col>
            <h6 class="fw-bold">รายการตรวจสอบ:</h6>

            <form-cleaning-history-validation
              :cleaning-history-id="id"
              v-model="form"
            />
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
