<script lang="ts" setup>
import { requiredIf } from "@vuelidate/validators";
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import ContactZone from "~~/models/ContactZone";

export type ContactZoneSelectData = {
  id: string;
};

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  showLabel?: boolean;
  modelValue?: ContactZoneSelectData | null;
  defaultValue?: any | null;
  options?: ContactZone[];
}

const attrs = useAttrs();

const toast = useToast();

const { api: swabApi, getContactZoneByName } = useSwab();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  required: false,
  showLabel: false,
  modelValue: null,
  defaultValue: null,
  options: () => [],
});

const emit = defineEmits(["update:modelValue"]);
const contactZoneNames = ["Zone 1", "Zone 2", "Zone 3"];
// const isFetched = ref(false);
const loading = ref(false);
const contactZoneIds = ref<String[]>([]);

const contactZoneOptions = computed(() =>
  props.options.length
    ? props.options
    : contactZoneNames.map((name) => getContactZoneByName(name)).filter(Boolean)
);

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

const contactZoneRequiredState = computed(() =>
  isFormInvalid("modelValue", ["requiredIfPropsRequired"])
);

const formGroupLabel = computed(() => (props.showLabel ? "Contact Zone" : ""));

const formGroupLabelClass = computed(() => (!props.showLabel ? "p-0" : ""));

const fetch = async () => {
  if (props.options.length) return;

  // if (!isFetched.value) {
  loading.value = true;

  try {
    const contactZoneData: ContactZone[] = await swabApi().loadAllContactZone();

    if (contactZoneData.length) {
      contactZoneIds.value = contactZoneData.map(({ id }) => id);

      if (modelValue.value === null && props.defaultValue !== null) {
        const defaultContactZone = getContactZoneByName(props.defaultValue);

        if (defaultContactZone) {
          emit("update:modelValue", { id: defaultContactZone.id });
        }
      }
    }
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูล contact zone ได้", { timeout: 1000 });
  } finally {
    loading.value = false;
    // isFetched.value = true;
  }
  // }
};
</script>

<template>
  <b-form-group
    id="fieldset-contact-zone"
    label-for="contactZoneName"
    :label="formGroupLabel"
    :label-class="formGroupLabelClass"
    :state="contactZoneRequiredState"
    v-bind="{ ...attrs }"
  >
    <v-select
      v-model="modelValue"
      :options="contactZoneOptions"
      label="contactZoneName"
      :loading="loading"
      :clearable="clearable"
      :disabled="disabled"
      :reduce="({ id }) => ({ id })"
      deselect-from-dropdown
      @open="fetch"
    >
      <template #selected-option="{ contactZoneName }">
        {{ contactZoneName }}
      </template>

      <template #option="{ contactZoneName }">
        {{ contactZoneName }}
      </template>

      <!-- <template #search="{ attributes, events }">
                    <input class="vs__search" :required="!modelValue" v-bind="attributes" v-on="events" />
                </template> -->
    </v-select>

    <b-form-invalid-feedback v-if="isInvalid" :state="contactZoneRequiredState">
      กรุณาเลือก Contact Zone
    </b-form-invalid-feedback>
  </b-form-group>
</template>
