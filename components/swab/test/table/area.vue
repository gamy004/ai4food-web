<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import checkLg from "~icons/bi/check-lg";
import crossIcon from "~icons/akar-icons/cross";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import { FormData as SwabTestFilterFormData } from "~~/components/swab/test/filter.vue";
import { Pagination } from "~~/composables/usePagination";
import { LoadAllSwabAreaHistoryFilter } from "~~/composables/useFilterSwabAreaHistory";

export interface Props {
  modelValue: SwabTestFilterFormData;
  pagination: Pagination;
  editSpecie?: boolean;
  readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: () => usePagination({ perPage: 20, currentPage: 1 }),
  editSpecie: false,
  readOnly: false,
});

const emit = defineEmits(["update:modelValue"]);

const toast = useToast();
const { formatThLocale, formatTimeThLocale, shiftToAbbreviation } = useDate();
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

const tableFields = computed(() => {
  const fields = [
    { key: "order", label: "ลำดับ" },
    { key: "date", label: "วัน" },
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
      label:
        props.editSpecie || props.readOnly
          ? "ผลตรวจสายพันธุ์เชื้อ"
          : "ผลตรวจเชื้อ",
      thClass: "text-center",
      tdClass: "text-center",
      thStyle: props.editSpecie || props.readOnly ? { width: "30%" } : {},
    },
  ];

  return fields;
});

const countTotal = ref(0);
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
      date: formatThLocale(new Date(swabAreaHistory.swabAreaDate), "ddMMyy"),
      time: swabAreaHistory.swabAreaSwabedAt
        ? formatTimeThLocale(swabAreaHistory.swabAreaSwabedAt)
        : "",
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

// const swabTestData = computed(() =>
//   displayData.value.map(({ swabTest }) => swabTest)
// );

// const paginatedData = computed(() =>
//   props.pagination.paginate(displayData.value)
// );

const fetch = async function fetch(props) {
  loading.value = true;
  error.value = false;
  hasData.value = true;
  countTotal.value = 0;
  swabAreaHistoryIds.value = [];

  const params: LoadAllSwabAreaHistoryFilter = {
    ...props.modelValue,
    skip: props.pagination.offset.value,
    take: props.pagination.$state.perPage,
  };

  if (props.editSpecie) {
    params.hasBacteria = true;
  }

  try {
    let [data, total = 0]: [SwabAreaHistory[], number] =
      await labApi().loadAllLabSwabAreaHistory(params);

    // if (props.editSpecie) {
    //   data = data.filter((record) => {
    //     const stateBacteria = getBacteriaStateBySwabTestId(record.swabTestId);

    //     return stateBacteria;
    //   });
    // }

    countTotal.value = total;

    if (data && data.length) {
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

watch(() => props, fetch, { immediate: true, deep: true });
</script>

<template>
  <div class="d-grid gap-2 mt-3">
    <div v-if="loading" class="col text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </div>

    <div v-else>
      <div v-if="hasData">
        <b-table
          id="swabTestAreaTable"
          class="pb-5"
          hover
          small
          responsive
          :items="displayData"
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
            <div v-if="readOnly">
              <badge-bacteria-specie
                :swab-test-id="item.swabTestId"
              ></badge-bacteria-specie>
            </div>

            <div v-else>
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
            </div>
          </template>
        </b-table>

        <base-pagination
          v-model="pagination.$state.currentPage"
          :per-page="pagination.$state.perPage"
          :total-rows="countTotal"
          aria-controls="swabTestAreaTable"
        />
      </div>

      <b-card v-else bg-variant="light">
        <b-card-text class="text-center">
          ไม่พบข้อมูลรายการจุดตรวจ Swab
        </b-card-text>
      </b-card>
    </div>
  </div>
</template>
