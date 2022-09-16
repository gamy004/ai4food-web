<script lang="ts" setup>
import { sortBy } from "lodash";
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import FacilityItem from "~~/models/FacilityItem";

export type facilitySelectData = {
  id: string;
  facilityId?: string;
  facilityItemName?: string;
};

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  facilityId?: string;
  modelValue?: facilitySelectData | null;
}

const toast = useToast();

const { api: facilityApi, getFacilityItemByIds } = useFacility();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  disabled: false,
  facilityId: null,
  modelValue: () => null,
});

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const facilityItemIds = ref([]);

const facilityItemOptions = computed(() => {
  const params: any = {};

  if (props.facilityId) {
    params.facilityId = props.facilityId;
  }

  const options = getFacilityItemByIds(facilityItemIds.value, params);

  return sortBy(options, ["facilityItemName"]);
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      const facilityItemData: FacilityItem[] =
        await facilityApi().loadAllFacilityItem();

      if (facilityItemData.length) {
        facilityItemIds.value = facilityItemData.map(({ id }) => id);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลไลน์ได้", { timeout: 1000 });
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
  <v-select
    v-model="modelValue"
    :options="facilityItemOptions"
    label="facilityItemName"
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    :reduce="({ id }) => ({ id })"
    deselect-from-dropdown
    @open="fetch({ facilityId: props.facilityId })"
  >
    <template #selected-option="{ facilityItemName }">
      {{ facilityItemName }}
    </template>

    <template #option="{ facilityItemName }">
      {{ facilityItemName }}
    </template>

    <!-- <template #search="{ attributes, events }">
            <input class="vs__search" :required="!modelValue" v-bind="attributes" v-on="events" />
        </template> -->
  </v-select>
</template>
