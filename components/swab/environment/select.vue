<script lang="ts" setup>
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import SwabEnvironment from "~~/models/SwabEnvironment";

export type SelectData = {
    id?: string;
    swabEnvironmentName?: string;
}

export interface Props {
    modelValue?: SelectData[]
}

const toast = useToast();

const {
  api: swabApi,
  getSwabEnvironmentByIds
} = useSwab();

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: () => []
  }
);

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const swabEnvironmentIds = ref([]);

const swabEnvironments = computed(() => getSwabEnvironmentByIds(swabEnvironmentIds.value));

const modelValue = computed({
  get: () => props.modelValue,

  set: value => emit("update:modelValue", value)
});

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      const swabEnvironmentData: SwabEnvironment[] = await swabApi().loadAllSwabEnvironment();

      if (swabEnvironmentData.length) {
        swabEnvironmentIds.value = swabEnvironmentData.map(({ id }) => id);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสภาพแวดล้อมได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

const getOptionLabel = function (option) {
  if (typeof option === "object") {
    if (!option.hasOwnProperty(this.label)) {
      return "";
    }

    return option[this.label];
  }

  return option;
};

onBeforeMount(fetch);
</script>

<template>
  <v-select
    v-model="modelValue"
    class="form-control p-0 border-0"
    multiple
    taggable
    :options="swabEnvironments"
    label="swabEnvironmentName"
    :get-option-label="getOptionLabel"
    :loading="loading"
    :create-option="swabEnvironmentName => ({ swabEnvironmentName })"
    :reduce="({ id, swabEnvironmentName }) => id ? { id } : { swabEnvironmentName }"
    :close-on-select="false"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ id, swabEnvironmentName }">
      {{ swabEnvironmentName }} {{ !id ? '(New)' : '' }}
    </template>
  </v-select>
</template>

<style lang="scss" scoped>
</style>
