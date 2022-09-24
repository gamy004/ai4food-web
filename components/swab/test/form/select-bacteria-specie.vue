<script lang="ts" setup>
import { Ref } from "vue";
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import BacteriaSpecie from "~~/models/BacteriaSpecie";
import SwabEnvironment from "~~/models/SwabEnvironment";

export type SelectData = {
  id?: string;
  bacteriaId?: string;
  bacteriaSpecieName?: string;
};

export interface Props {
  swabTestId: string;
  modelValue?: SelectData[];
  autoFetch?: boolean;
}

const toast = useToast();

const {
  api: labApi,
  getBacteriaSpecieByBacteriaIds,
  getBacteriaBySwabTestId,
  getBacteriaSpecieBySwabTestId,
} = useLab();

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  autoFetch: true,
});

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const submitting = ref(false);
// const bacteriaSpecieIds = ref([]);

const swabTestBacteria = computed(() =>
  getBacteriaBySwabTestId(props.swabTestId)
);

const bacteriaSpecies = computed(() => {
  const bacteriaIds = swabTestBacteria.value.map(({ id }) => id);

  const bacteriaSpecies = bacteriaIds.length
    ? getBacteriaSpecieByBacteriaIds(bacteriaIds)
    : [];

  return bacteriaSpecies;
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const stateBacteriaSpecie = computed({
  get: () => getBacteriaSpecieBySwabTestId(props.swabTestId),

  set: (selectedData: SelectData[]) => {
    updateBacteriaSpecies(selectedData);
  },
});

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      await labApi().loadAllBacteriaSpecies();
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูล bacteria specie ได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

const updateBacteriaSpecies = async (selectedData: SelectData[]) => {
  submitting.value = true;

  let bacteriaSpecies = selectedData.map(({ id: bacteriaSpecieId }) => ({
    bacteriaSpecieId,
  }));

  try {
    await labApi().updateSwabTestBacteriaSpecies(
      props.swabTestId,
      bacteriaSpecies
    );
  } catch (e) {
    toast.error("อัพเดตผลสายพันธุ์เชื้อไม่สำเร็จ", { timeout: 1000 });
  } finally {
    submitting.value = false;
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

onBeforeMount(async () => {
  if (props.autoFetch) {
    isFetched.value = false;

    await fetch();
  }
});
</script>

<template>
  <v-select
    v-model="stateBacteriaSpecie"
    class="form-control p-0 border-0"
    multiple
    :options="bacteriaSpecies"
    label="bacteriaSpecieName"
    :get-option-label="getOptionLabel"
    :loading="loading || submitting"
    :reduce="
      ({ id, bacteriaSpecieName, bacteriaId }) =>
        id ? { id, bacteriaId } : { bacteriaSpecieName }
    "
    :close-on-select="false"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ bacteriaSpecieName }">
      {{ bacteriaSpecieName }}
    </template>
  </v-select>
</template>
