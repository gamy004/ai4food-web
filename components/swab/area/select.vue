<script lang="ts" setup>
import { sortBy } from "lodash";
import { useToast } from "vue-toastification";
import SwabArea from "~~/models/SwabArea";
import vSelect from "vue-select";

export type SwabAreaSelectData = {
  id: string;
};

export interface Props {
  facilityId?: string | null;
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: SwabAreaSelectData | null;
}

const toast = useToast();

const { api: swabApi, getSwabAreaByIds } = useSwab();

const props = withDefaults(defineProps<Props>(), {
  facilityId: null,
  clearable: false,
  disabled: false,
  modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

// const isFetched = ref(false);
const loading = ref(false);
const swabAreaIds = ref([]);

const swabAreaOptions = computed(() => {
  const params: any = {};

  if (props.facilityId) {
    params.facilityId = props.facilityId;
  }

  const options = getSwabAreaByIds(swabAreaIds.value, params);

  return sortBy(options, ["swabAreaName"]);
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const fetch = async () => {
  // if (!isFetched.value) {
  loading.value = true;

  try {
    const swabAreaData: SwabArea[] = await swabApi().loadAllMainSwabArea();

    if (swabAreaData.length) {
      swabAreaIds.value = swabAreaData.map(({ id }) => id);
    }
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูลจุดตรวจตรวจได้", { timeout: 1000 });
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
    :options="swabAreaOptions"
    label="swabAreaName"
    :loading="loading"
    :clearable="clearable"
    :disabled="disabled"
    :reduce="({ id }) => ({ id })"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ swabAreaName }">
      {{ swabAreaName }}
    </template>

    <template #option="{ swabAreaName }">
      {{ swabAreaName }}
    </template>
  </v-select>
</template>
