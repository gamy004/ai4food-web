<script lang="ts" setup>
import { useToast } from "vue-toastification";
import SwabSampleType from "~~/models/SwabSampleType";
import vSelect from "vue-select";

export type SwabSampleTypeSelectData = {
  id: string;
};

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  once?: boolean;
  lazy?: boolean;
  modelValue?: SwabSampleTypeSelectData | null;
}

const toast = useToast();

const { api: swabSampleTypeApi, getAllSwabSampleTypes } = useSwab();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  once: false,
  lazy: false,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const swabSampleTypeIds = ref<string[]>([]);

const SwabSampleTypeOptions = computed(() => {
  const swabSampleTypes = getAllSwabSampleTypes();

  return swabSampleTypes.map(({ id, swabSampleTypeName }) => ({
    id,
    swabSampleTypeName,
  }));
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const fetch = async () => {
  if (props.once && isFetched.value) return;

  // if (!isFetched.value) {
  loading.value = true;

  try {
    const swabSampleTypeData: SwabSampleType[] =
      await swabSampleTypeApi().loadAllSwabSampleType();

    if (swabSampleTypeData.length) {
      swabSampleTypeIds.value = swabSampleTypeData.map(({ id }) => id);
    }
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูลประเภทตัวอย่างได้", { timeout: 1000 });
  } finally {
    loading.value = false;
    isFetched.value = true;
  }
  // }
};

onBeforeMount(async () => {
  if (!props.lazy) await fetch();
});
</script>

<template>
  <v-select
    v-model="modelValue"
    :options="SwabSampleTypeOptions"
    label="swabSampleTypeName"
    :loading="loading"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="({ id }) => ({ id })"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ swabSampleTypeName }">
      {{ swabSampleTypeName }}
    </template>

    <template #option="{ swabSampleTypeName }">
      {{ swabSampleTypeName }}
    </template>
  </v-select>
</template>
