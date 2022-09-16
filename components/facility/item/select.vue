<script lang="ts" setup>
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import FacilityItem from "~~/models/FacilityItem";

export type facilitySelectData = {
  id: string;
  facilityId?: string;
  facilityItemName?: string;
}

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  facilityId?: string;
  modelValue?: facilitySelectData | null;
}

const toast = useToast();

const {
  api: facilityApi,
  getFacilityItemByIds
} = useFacility();

const props = withDefaults(
  defineProps<Props>(),
  {
    clearable: false,
    disabled: false,
    facilityId: null,
    modelValue: () => null
  }
);

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const facilityItemIds = ref([]);

const facilityItems = computed(() => getFacilityItemByIds(facilityItemIds.value));

const modelValue = computed({
  get: () => props.modelValue,

  set: value => emit("update:modelValue", value)
});

const fetch = async (props) => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      const facilityItemData: FacilityItem[] = await facilityApi().loadAllFacilityItem(props.facilityId);

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

watch(() => props, async (value) => {
  isFetched.value = false;

  await fetch(value);
}, { immediate: true, deep: true });
</script>

<template>
  <v-select v-model="modelValue" :options="facilityItems" label="facilityItemName" :loading="loading"
    :disabled="disabled" :clearable="clearable" :reduce="({ id }) => ({ id })" deselect-from-dropdown @open="fetch">
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
