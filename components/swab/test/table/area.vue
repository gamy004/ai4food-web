<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import checkLg from "~icons/bi/check-lg";
import crossIcon from "~icons/akar-icons/cross";
import { ShiftMapper } from "~~/composables/useDate";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import { FormData as SwabTestFilterFormData } from "~~/components/swab/test/filter.vue";

export interface Props {
  modelValue: SwabTestFilterFormData;
  perPage?: number;
  currentPage?: number;
  editSpecie?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 100,
  currentPage: 1,
  editSpecie: false,
});

const emit = defineEmits(["update:modelValue"]);

const toast = useToast();
const { formatTimeThLocale, shiftToAbbreviation } = useDate();
const { getFacilityById, getFacilityItemById } = useFacility();
const {
  getSwabPeriodById,
  getSwabAreaById,
  getSwabAreaHistoryById,
  getSwabTestById,
} = useSwab();
const {
  getBacteriaBySwabTestId,
  getBacteriaStateBySwabTestId,
  api: labApi,
} = useLab();

const pagination = usePagination({
  perPage: props.perPage,
  currentPage: props.currentPage,
});

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const tableFields = computed(() => {
  const fields = [
    { key: "order", label: "ลำดับ" },
    { key: "time", label: "เวลา" },
    { key: "shift", label: "กะ" },
    { key: "swabTestCode", label: "รหัส" },
    { key: "swabPeriodName", label: "ช่วงตรวจ" },
    { key: "facilityName", label: "เครื่อง" },
    { key: "facilityItemName", label: "ไลน์" },
    { key: "swabAreaName", label: "จุดตรวจ" },
    {
      key: "status",
      label: "สถานะ",
      thClass: "text-center",
      tdClass: "text-center",
    },
    {
      key: "action",
      label: props.editSpecie ? "ผลตรวจสายพันธุ์เชื้อ" : "ผลตรวจเชื้อ",
      thClass: "text-center",
      tdClass: "text-center",
      thStyle: props.editSpecie ? { width: "40%" } : {},
    },
  ];

  return fields;
});

const swabAreaHistoryIds = ref([]);
const submittingSwabTestId = ref(null);
const hasData = ref(true);
const loading = ref(false);
const error = ref(false);

const displayData = computed(() => {
  return swabAreaHistoryIds.value.map((swabAreaHistoryId, idx) => {
    const swabAreaHistory = getSwabAreaHistoryById(swabAreaHistoryId);

    let facility = null;
    const swabTest = getSwabTestById(swabAreaHistory.swabTestId);

    const bacteria = getBacteriaBySwabTestId(swabAreaHistory.swabTestId);

    const stateBacteria = getBacteriaStateBySwabTestId(
      swabAreaHistory.swabTestId
    );

    const swabPeriod = getSwabPeriodById(swabAreaHistory.swabPeriodId);

    const swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);

    const facilityItem = getFacilityItemById(swabAreaHistory.facilityItemId);

    if (swabArea) {
      facility = getFacilityById(swabArea.facilityId);
    }

    return {
      index: idx,
      order: idx + 1,
      time: formatTimeThLocale(swabAreaHistory.swabAreaSwabedAt),
      shift: swabAreaHistory.shift,
      swabTestCode: swabTest ? swabTest.swabTestCode : "",
      swabPeriodName: swabPeriod ? swabPeriod.swabPeriodName : "",
      facilityName: facility ? facility.facilityName : "",
      facilityItemName: facilityItem ? facilityItem.facilityItemName : "",
      swabAreaName: swabArea ? swabArea.swabAreaName : "",
      id: swabAreaHistory.id,
      swabTestId: swabAreaHistory.swabTestId,
      swabTest,
      stateBacteria,
      bacteria,
      bacteriaSpecie: [],
    };
  });
});

const paginatedData = computed(() => pagination.paginate(displayData.value));

const fetch = async function fetch(form) {
  hasData.value = true;
  error.value = false;
  loading.value = true;
  swabAreaHistoryIds.value = [];

  try {
    let data: SwabAreaHistory[] = await labApi().loadAllLabSwabAreaHistory({
      ...form.value,
    });

    if (data && data.length) {
      if (props.editSpecie) {
        data = data.filter((record) => {
          const stateBacteria = getBacteriaStateBySwabTestId(record.swabTestId);

          return stateBacteria;
        });
      }

      swabAreaHistoryIds.value = data.map(({ id }) => id);
    } else {
      hasData.value = false;
    }
  } catch (e) {
    error.value = true;

    toast.error("ดึงรายการจุดตรวจ Swab ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
  } finally {
    loading.value = false;
  }
};

watch(() => form, fetch, { immediate: true, deep: true });
</script>

<template>
  <div class="d-grid gap-2 mt-3">
    <div v-if="loading" class="col text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </div>

    <div v-if="hasData">
      <b-table
        id="swabTestAreaTable"
        class="pb-5"
        hover
        small
        responsive
        :items="paginatedData"
        :fields="tableFields"
      >
        <template #cell(shift)="{ item }">
          {{ shiftToAbbreviation(item.shift) }}
        </template>

        <template #cell(status)="{ item }">
          <line-md-loading-twotone-loop
            v-if="submittingSwabTestId === item.swabTestId"
            :style="{ fontSize: '1.25em' }"
          />

          <badge-bacteria-status
            v-else
            :swab-test="item.swabTest"
          ></badge-bacteria-status>
        </template>

        <template #cell(action)="{ item }">
          <swab-test-form-select-bacteria-specie
            v-if="editSpecie"
            :swab-test-id="item.swabTestId"
            :auto-fetch="false"
            is-static
            attach-to-body
          />

          <swab-test-form-radio-bacteria
            v-else
            :swab-test-id="item.swabTestId"
            v-model="submittingSwabTestId"
          ></swab-test-form-radio-bacteria>
        </template>
      </b-table>

      <b-pagination
        v-model="pagination.$state.currentPage"
        align="center"
        :total-rows="displayData.length"
        :per-page="pagination.$state.perPage"
        aria-controls="result-table"
      />
    </div>

    <b-card v-else bg-variant="light">
      <b-card-text class="text-center">
        ไม่พบข้อมูลรายการจุดตรวจ Swab
      </b-card-text>
    </b-card>
  </div>
</template>
