<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import checkLg from "~icons/bi/check-lg";
import crossIcon from "~icons/akar-icons/cross";
import { ShiftMapper } from "~~/composables/useDate";
import SwabProductHistory from "~~/models/SwabProductHistory";
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
const { formatThLocale, formatTimeThLocale } = useDate();
const { getProductById } = useProduct();
const { getFacilityById, getFacilityItemById } = useFacility();
const { getSwabPeriodById, getSwabProductHistoryById } = useSwab();
const { getSwabTestById, getBacteriaStateBySwabTestId, api: labApi } = useLab();

const pagination = usePagination({
  perPage: props.perPage,
  currentPage: props.currentPage,
});

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
  { key: "status", label: "สถานะ" },
  {
    key: "action",
    label: "ผลตรวจเชื้อ",
    thClass: "text-center",
    tdClass: "text-center",
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
      shift: ShiftMapper[swabProductHistory.shift],
      swabTestCode: swabTest ? swabTest.swabTestCode : "",
      swabPeriodName: swabPeriod ? swabPeriod.swabPeriodName : "",
      facilityName: facility ? facility.facilityName : "",
      facilityItemName: facilityItem ? facilityItem.facilityItemName : "",
      productName: product ? product.productName : "",
      productDate: formatThLocale(new Date(swabProductHistory.productDate)),
      productLot: swabProductHistory.productLot,
      id: swabProductHistory.id,
      swabTestId: swabProductHistory.swabTestId,
      swabTest,
      stateBacteria,
    };
  });
});

const paginatedData = computed(() => pagination.paginate(displayData.value));

const fetch = async () => {
  hasData.value = true;
  error.value = false;
  loading.value = true;
  swabProductHistoryIds.value = [];

  try {
    const data: SwabProductHistory[] =
      await labApi().loadAllLabSwabProductHistory({
        ...form.value,
      });

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

    <div v-if="hasData">
      <b-table
        id="swabTestAreaTable"
        hover
        small
        responsive
        :items="paginatedData"
        :fields="tableFields"
      >
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
          <swab-test-form-radio-bacteria
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
        ไม่พบข้อมูลรายการตรวจสินค้า
      </b-card-text>
    </b-card>
  </div>
</template>

<style lang="scss" scoped>
.input {
  &__swab-area-date {
    margin-left: 0.1rem !important;
  }
}
</style>
