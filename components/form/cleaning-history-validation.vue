<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import {
  UpdateCleaningHistoryValidationBody,
  UpsertCleaningHistoryValidationData,
} from "~~/composables/useCleaning";
import CleaningHistoryValidation from "~~/models/CleaningHistoryValidation";
import CleaningValidation from "~~/models/CleaningValidation";

export interface Props {
  cleaningHistoryId: string;
  modelValue: UpdateCleaningHistoryValidationBody;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const { getCleaningHistoryById } = useCleaning();
const {
  getSwabAreaHistoryById,
  getSwabPeriodById,
  loadCleaningValidationToSwabPeriod,
} = useSwab();

const cleaningHistory = computed(() =>
  getCleaningHistoryById(props.cleaningHistoryId)
);

const swabAreaHistory = computed(() =>
  cleaningHistory.value
    ? getSwabAreaHistoryById(cleaningHistory.value.swabAreaHistoryId)
    : null
);

const cleaningValidations = computed(() => {
  let cleaningValidations: CleaningValidation[] = [];

  if (swabAreaHistory.value) {
    const swabPeriodWithCleaningValidations =
      loadCleaningValidationToSwabPeriod(
        getSwabPeriodById(swabAreaHistory.value.swabPeriodId)
      );

    if (swabPeriodWithCleaningValidations?.cleaningValidations.length) {
      cleaningValidations = [
        ...swabPeriodWithCleaningValidations.cleaningValidations,
      ];
    }
  }

  return cleaningValidations;
});

const mapCleaningValidation = computed(() => {
  const map = new Map();

  cleaningValidations.value.forEach((item) => map.set(item.id, item));

  return map;
});

const mapCleaningHistoryValidation = computed(() => {
  const map = new Map();

  props.modelValue.cleaningHistoryValidations.forEach((item) =>
    map.set(item.cleaningValidationId, item)
  );

  return map;
});

const form = ref({
  cleaningHistoryValidations: cleaningValidations.value.map(
    (cleaningValidation) => {
      const entity: UpsertCleaningHistoryValidationData = {
        cleaningValidationId: cleaningValidation.id,
        cleaningHistoryId: props.cleaningHistoryId,
        pass: false,
      };

      const mapEntity = mapCleaningHistoryValidation.value.get(
        cleaningValidation.id
      );

      if (mapEntity) {
        entity.id = mapEntity.id;
        entity.pass = mapEntity.pass;
      }

      return entity;
    }
  ),
});

const validationRules = computed(() => ({
  cleaningHistoryValidations: {
    required,
    $lazy: true,
  },
}));

const { isFormInvalid } = useValidation(validationRules, props.modelValue);
</script>

<template>
  <b-row>
    <b-col>
      <b-list-group class="list-group__cleaning-validation">
        <b-list-group-item
          v-for="(
            cleaningHistoryValidation, index
          ) in form.cleaningHistoryValidations"
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
            v-model="form.cleaningHistoryValidations[index]"
          ></radio-cleaning-history-validation>
        </b-list-group-item>
      </b-list-group>
    </b-col>
  </b-row>
</template>
