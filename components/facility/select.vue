<script lang="ts" setup>
import { requiredIf } from "@vuelidate/validators";
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import Facility from "~~/models/Facility";

export type FacilitySelectData = {
  id: string;
};

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  showLabel?: boolean;
  modelValue?: FacilitySelectData | null;
  defaultValue?: any | null;
}

const attrs = useAttrs();

const toast = useToast();

const { api: facilityApi, getFacilityByIds, getFacilityByName } = useFacility();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  required: false,
  showLabel: false,
  modelValue: null,
  defaultValue: null,
});

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const facilityIds = ref([]);

const facilityOptions = computed(() => getFacilityByIds(facilityIds.value));

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

const { isInvalid, isValidated, isFormInvalid } = useValidation(
  validationRules,
  {
    modelValue,
  }
);

const facilityRequiredState = computed(() =>
  isFormInvalid("modelValue", ["requiredIfPropsRequired"])
);

const formInvalidState = computed(() => {
  let isFacilityInvalid = null;

  if (isInvalid.value) {
    isFacilityInvalid = facilityRequiredState.value;
  }

  return {
    facility: isFacilityInvalid,
  };
});

const formGroupLabel = computed(() => (props.showLabel ? "เครื่องจักร" : ""));

const formGroupLabelClass = computed(() => (!props.showLabel ? "p-0" : ""));

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      const facilityData: Facility[] =
        await facilityApi().loadAllSwabFacility();

      if (facilityData.length) {
        facilityIds.value = facilityData.map(({ id }) => id);

        if (modelValue.value === null && props.defaultValue !== null) {
          const defaultFacility = getFacilityByName(props.defaultValue);

          if (defaultFacility) {
            emit("update:modelValue", { id: defaultFacility.id });
          }
        }
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลเครื่องได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

onBeforeMount(async () => {
  isFetched.value = false;

  await fetch();
});
</script>

<template>
  <b-form-group
    id="fieldset-facility"
    label-for="facilityName"
    :label="formGroupLabel"
    :label-class="formGroupLabelClass"
    :state="formInvalidState.facility"
    v-bind="{ ...attrs }"
  >
    <v-select
      v-model="modelValue"
      :options="facilityOptions"
      label="facilityName"
      :loading="loading"
      :clearable="clearable"
      :disabled="disabled"
      :reduce="({ id }) => ({ id })"
      deselect-from-dropdown
      @open="fetch"
    >
      <template #selected-option="{ facilityName }">
        {{ facilityName }}
      </template>

      <template #option="{ facilityName }">
        {{ facilityName }}
      </template>

      <!-- <template #search="{ attributes, events }">
                    <input class="vs__search" :required="!modelValue" v-bind="attributes" v-on="events" />
                </template> -->
    </v-select>

    <b-form-invalid-feedback v-if="isInvalid" :state="facilityRequiredState">
      กรุณาเลือกเครื่องจักร
    </b-form-invalid-feedback>
  </b-form-group>
</template>
