<script lang="ts" setup>
import { useToast } from "vue-toastification";
import SwabPeriod from "~~/models/SwabPeriod";
import vSelect from "vue-select";

export type SwabPeriodSelectData = {
  id: string;
};

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: SwabPeriodSelectData | null;
}

const toast = useToast();

const { api: swabPeriodApi, getSwabPeriodByNames } = useSwab();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

// const isFetched = ref(false);
const loading = ref(false);
const swabPeriodIds = ref([]);

const swabPeriodNames = [
  "ก่อน Super Big Cleaning",
  "หลัง Super Big Cleaning",
  "หลังประกอบเครื่อง",
  "ก่อนล้างระหว่างงาน",
  "หลังล้างระหว่างงาน",
  "เดินไลน์หลังพัก 4 ชม.",
  "ก่อนล้างท้ายกะ",
  "หลังล้างท้ายกะ",
];

const swabPeriodOptions = computed(() => {
  const swabPeriods = getSwabPeriodByNames(swabPeriodNames);

  return swabPeriods.map(({ id, swabPeriodName }) => ({
    id,
    swabPeriodName,
  }));
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const fetch = async () => {
  // if (!isFetched.value) {
  loading.value = true;

  try {
    const swabPeriodData: SwabPeriod[] =
      await swabPeriodApi().loadAllSwabPeriod();

    if (swabPeriodData.length) {
      swabPeriodIds.value = swabPeriodData.map(({ id }) => id);
    }
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูลช่วงตรวจได้", { timeout: 1000 });
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
  <v-select
    v-model="modelValue"
    :options="swabPeriodOptions"
    label="swabPeriodName"
    :loading="loading"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="({ id }) => ({ id })"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ swabPeriodName }">
      {{ swabPeriodName }}
    </template>

    <template #option="{ swabPeriodName }">
      {{ swabPeriodName }}
    </template>
  </v-select>
</template>
