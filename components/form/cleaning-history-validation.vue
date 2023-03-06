<script lang="ts" setup>
import { useToast } from "vue-toastification";
import {
  UpdateCleaningHistoryValidationBody,
  UpsertCleaningHistoryValidationData,
} from "~~/composables/useCleaning";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
  cleaningHistoryId: string;
  swabPeriodId: string;
  swabAreaId: string;
  modelValue: UpdateCleaningHistoryValidationBody;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const toast = useToast();
const {
  getCleaningHistoryById,
  loadCleaningHistoryValidationToCleaningHistory,
} = useCleaning();
const { api: swabApi } = useSwab();

const loading = ref(false);
const error = ref(false);
const cleaningValidations = ref([]);

const cleaningHistory = computed(() =>
  loadCleaningHistoryValidationToCleaningHistory(
    getCleaningHistoryById(props.cleaningHistoryId)
  )
);

const mapCleaningHistoryValidation = computed(() => {
  const map = new Map();

  cleaningHistory.value.cleaningHistoryValidations.forEach((item) =>
    map.set(item.cleaningValidationId, item)
  );

  return map;
});

const mapCleaningValidation = computed(() => {
  const map = new Map();

  cleaningValidations.value.forEach((item) => map.set(item.id, item));

  return map;
});

// const form = ref({
//   cleaningHistoryValidations: cleaningValidations.value.map(
//     (cleaningValidation) => {
//       const entity: UpsertCleaningHistoryValidationData = {
//         cleaningValidationId: cleaningValidation.id,
//         cleaningHistoryId: props.cleaningHistoryId,
//         pass: null,
//       };

//       const mapEntity = mapCleaningHistoryValidation.value.get(
//         cleaningValidation.id
//       );

//       if (mapEntity) {
//         entity.id = mapEntity.id;
//         entity.pass = mapEntity.pass;
//       }

//       return entity;
//     }
//   ),
// });

// const validationRules = computed(() => ({
//   cleaningHistoryValidations: {
//     required,
//     $lazy: true,
//   },
// }));

// const { isFormInvalid } = useValidation(validationRules, props.modelValue);

const init = async () => {
  error.value = false;

  loading.value = true;

  try {
    const { swabPeriodId, swabAreaId } = props;

    const swabCleaningValidations = await swabApi().loadSwabCleaningValidation({
      swabPeriodId,
      swabAreaId,
    });

    if (swabCleaningValidations.length) {
      const cleaningValidationsEntity = swabCleaningValidations.map(
        ({ cleaningValidation }) => cleaningValidation
      );

      if (cleaningValidationsEntity.length) {
        cleaningValidations.value = cleaningValidationsEntity;

        props.modelValue.cleaningHistoryValidations =
          cleaningValidationsEntity.map((cleaningValidation) => {
            const entity: UpsertCleaningHistoryValidationData = {
              cleaningValidationId: cleaningValidation.id,
              pass: null,
            };

            const mapEntity = mapCleaningHistoryValidation.value.get(
              cleaningValidation.id
            );

            if (mapEntity) {
              entity.id = mapEntity.id;
              entity.pass = mapEntity.pass;
            }

            return entity;
          });
      }
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error(
      "โหลดข้อมูลรายการตรวจสอบความสะอาดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      {
        timeout: 1000,
      }
    );
  } finally {
    loading.value = false;
  }
};

onBeforeMount(async () => {
  await init();
});
</script>

<template>
  <b-row>
    <b-col v-if="loading" class="text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </b-col>

    <b-col v-else>
      <b-list-group class="list-group__cleaning-validation">
        <b-list-group-item
          v-for="(
            cleaningHistoryValidation, index
          ) in modelValue.cleaningHistoryValidations"
          :key="`cleaning-history-validation-${cleaningHistoryValidation.cleaningValidationId}`"
          class="d-flex justify-content-between align-items-start"
        >
          <div class="ms-2 me-auto">
            {{
              mapCleaningValidation.get(
                cleaningHistoryValidation.cleaningValidationId
              ).cleaningValidationName
            }}
          </div>

          <radio-cleaning-history-validation
            :cleaning-validation-id="
              cleaningHistoryValidation.cleaningValidationId
            "
            v-model="modelValue.cleaningHistoryValidations[index]"
            required
          ></radio-cleaning-history-validation>
        </b-list-group-item>
      </b-list-group>
    </b-col>

    <b-col v-if="error" class="text-center mt-3">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลรายการตรวจสอบความสะอาด</p>

      <b-button variant="dark" @click="init"> โหลดข้อมูลใหม่ </b-button>
    </b-col>
  </b-row>
</template>
