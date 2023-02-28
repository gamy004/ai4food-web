<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CleaningProgram from "~~/models/CleaningProgram";
import vSelect from "vue-select";
import { requiredIf } from "@vuelidate/validators";

export type CleaningProgramSelectData = {
  id: string;
};

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  showLabel?: boolean;
  modelValue?: CleaningProgramSelectData | null;
}

const attrs = useAttrs();

const toast = useToast();

const { api: cleaningApi, getCleaningProgramByNames } = useCleaning();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  required: false,
  showLabel: true,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

// const isFetched = ref(false);
const loading = ref(false);
const cleaningProgramIds = ref([]);
const cleaningProgramNames = ["P1", "P2", "P3"];

const cleaningProgramOptions = computed(() => {
  const cleaningPrograms = getCleaningProgramByNames(cleaningProgramNames);

  return cleaningPrograms.map(
    ({ id, cleaningProgramName, cleaningProgramDescription }) => ({
      id,
      label: `${cleaningProgramName}: ${cleaningProgramDescription}`,
    })
  );
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const validationRules = {
  modelValue: {
    requiredIfPropsRequired: requiredIf(() => props.required),
    $lazy: true,
  },
};

const { isInvalid, isFormInvalid } = useValidation(validationRules, {
  modelValue,
});

const cleaningProgramRequiredState = computed(() =>
  isFormInvalid("modelValue", ["requiredIfPropsRequired"])
);

const formGroupLabel = computed(() =>
  props.showLabel ? "โปรแกรมทำความสะอาด" : ""
);

const formGroupLabelClass = computed(() => (!props.showLabel ? "p-0" : ""));

const fetch = async () => {
  // if (!isFetched.value) {
  loading.value = true;

  try {
    const cleaningProgramData: CleaningProgram[] =
      await cleaningApi().loadCleaningProgram();

    if (cleaningProgramData.length) {
      cleaningProgramIds.value = cleaningProgramData.map(({ id }) => id);
    }
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูลโปรแกรมทำความสะอาดได้", { timeout: 1000 });
  } finally {
    loading.value = false;
    // isFetched.value = true;
  }
  // }
};

onBeforeMount(async () => {
  // isFetched.value = false;

  await fetch();
});
</script>

<template>
  <b-form-group
    id="fieldset-cleaning-program"
    label-for="cleaningProgram"
    :label="formGroupLabel"
    :label-class="formGroupLabelClass"
    :state="cleaningProgramRequiredState"
    v-bind="{ ...attrs }"
  >
    <v-select
      v-model="modelValue"
      :options="cleaningProgramOptions"
      :loading="loading"
      :clearable="clearable"
      :disabled="disabled"
      :reduce="({ id }) => ({ id })"
      deselect-from-dropdown
      @open="fetch"
    >
      <template #selected-option="{ label }">
        {{ label }}
      </template>

      <template #option="{ label }">
        {{ label }}
      </template>
    </v-select>

    <b-form-invalid-feedback
      v-if="isInvalid"
      :state="cleaningProgramRequiredState"
    >
      กรุณาเลือกโปรแกรมทำความสะอาด
    </b-form-invalid-feedback>
  </b-form-group>
</template>
