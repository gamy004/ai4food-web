<script lang="ts" setup>
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import BacteriaSpecie from "~~/models/BacteriaSpecie";
import SwabEnvironment from "~~/models/SwabEnvironment";

export type SelectData = {
  id?: string;
  bacteriaSpecieName?: string;
};

export interface Props {
  modelValue?: SelectData[];
}

const toast = useToast();

const {
  api: labApi,
  getBacteriaSpecieByIds,
  //   getBacteriaBySwabTestId,
  //   getBacteriaSpecieBySwabTestId,
} = useLab();

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const bacteriaSpecieIds = ref([]);

const bacteriaSpecies = computed(() =>
  getBacteriaSpecieByIds(bacteriaSpecieIds.value)
);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      const bacteriaSpecieData: BacteriaSpecie[] =
        await labApi().loadAllBacteriaSpecies();

      if (bacteriaSpecieData.length) {
        bacteriaSpecieIds.value = bacteriaSpecieData.map(({ id }) => id);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูล bacteria specie ได้", { timeout: 1000 });
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
    :options="bacteriaSpecies"
    label="bacteriaSpecieName"
    :get-option-label="getOptionLabel"
    :loading="loading"
    :create-option="(bacteriaSpecieName) => ({ bacteriaSpecieName })"
    :reduce="
      ({ id, bacteriaSpecieName }) => (id ? { id } : { bacteriaSpecieName })
    "
    :close-on-select="false"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ id, bacteriaSpecieName }">
      {{ bacteriaSpecieName }} {{ !id ? "(New)" : "" }}
    </template>
  </v-select>
</template>
