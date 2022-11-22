<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import SwabProductHistory from "~~/models/SwabProductHistory";
import { FormData as SwabTestFilterFormData } from "~~/components/swab/test/filter.vue";
import { Pagination } from "~~/composables/usePagination";
import { LoadAllSwabProductHistoryFilter } from "~~/composables/useFilterSwabProductHistory";

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
const { formatTimeThLocale, shiftToAbbreviation } = useDate();
const { getProductById } = useProduct();
const { getFacilityById, getFacilityItemById } = useFacility();
const { getSwabPeriodById, getSwabProductHistoryById } = useSwab();
const { getSwabTestById, getBacteriaStateBySwabTestId, api: labApi } = useLab();

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const tableFields = [
  { key: "order", label: "ลำดับ" },
  { key: "time", label: "เวลา" },
  { key: "shift", label: "กะ" },
  { key: "swabTestCode", label: "รหัส" },
  { key: "swabPeriodName", label: "ช่วงตรวจ" },
  { key: "facilityName", label: "เครื่อง" },
  { key: "facilityItemName", label: "ไลน์" },
  { key: "productName", label: "สินค้า" },
  { key: "productDate", label: "วันที่ผลิต" },
  { key: "productLot", label: "SubLot" },
  {
    key: "status",
    thClass: "text-center",
    tdClass: "text-center",
    label: "สถานะ",
  },
  {
    key: "action",
    label: props.editSpecie ? "ผลตรวจสายพันธุ์เชื้อ" : "ผลตรวจเชื้อ",
    thClass: "text-center",
    tdClass: "text-center",
    thStyle: props.editSpecie ? { width: "40%" } : {},
  },
];
const swabProductHistoryIds = ref([]);
const submittingSwabTestId = ref(null);
const hasData = ref(true);
const loading = ref(false);
const error = ref(false);

const displayData = computed(() => {
  return swabProductHistoryIds.value.map((swabProductHistoryId, idx) => {
    const swabProductHistory = getSwabProductHistoryById(swabProductHistoryId);

    let facility = null;
    const swabTest = getSwabTestById(swabProductHistory.swabTestId);
    const stateBacteria = getBacteriaStateBySwabTestId(
      swabProductHistory.swabTestId
    );

    const swabPeriod = getSwabPeriodById(swabProductHistory.swabPeriodId);
    const product = getProductById(swabProductHistory.productId);
    const facilityItem = getFacilityItemById(swabProductHistory.facilityItemId);

    if (facilityItem) {
      facility = getFacilityById(facilityItem.facilityId);
    }

    return {
      index: idx,
      order: idx + 1,
      time: formatTimeThLocale(swabProductHistory.swabProductSwabedAt),
      shift: swabProductHistory.shift,
      swabTestCode: swabTest ? swabTest.swabTestCode : "",
      swabPeriodName: swabPeriod ? swabPeriod.swabPeriodName : "",
      facilityName: facility ? facility.facilityName : "",
      facilityItemName: facilityItem ? facilityItem.facilityItemName : "",
      productName: product ? product.productName : "",
      productDate: swabProductHistory.shortProductDate,
      productLot: swabProductHistory.productLot,
      id: swabProductHistory.id,
      swabTestId: swabProductHistory.swabTestId,
      swabTest,
      stateBacteria,
    };
  });
});

const paginatedData = computed(() =>
  props.pagination.paginate(displayData.value)
);

const fetch = async () => {
  loading.value = true;
  error.value = false;
  hasData.value = true;
  swabProductHistoryIds.value = [];

  try {
    const params: LoadAllSwabProductHistoryFilter = { ...form.value };

    if (props.editSpecie) {
      params.hasBacteria = true;
    }

    let data: SwabProductHistory[] =
      await labApi().loadAllLabSwabProductHistory(params);

    // if (props.editSpecie) {
    //   data = data.filter((record) => {
    //     const stateBacteria = getBacteriaStateBySwabTestId(record.swabTestId);

    //     return stateBacteria;
    //   });
    // }

    if (data && data.length) {
      swabProductHistoryIds.value = data.map(({ id }) => id);
    } else {
      hasData.value = false;
    }
  } catch (e) {
    error.value = true;

    toast.error("ดึงรายการตรวจสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
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

    <div v-else>
      <div v-if="hasData">
        <b-table
          id="swabTestProductTable"
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
          :total-rows="displayData.length"
          aria-controls="swabTestProductTable"
        />
      </div>

      <b-card v-else bg-variant="light">
        <b-card-text class="text-center">
          ไม่พบข้อมูลรายการตรวจสินค้า
        </b-card-text>
      </b-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input {
  &__swab-area-date {
    margin-left: 0.1rem !important;
  }
}
</style>
