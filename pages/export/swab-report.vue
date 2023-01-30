<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import IcBaselineRefresh from "~icons/ic/baseline-refresh";
import DownloadIcon from "~icons/carbon/download";
import { Shift, DateRangeInterface } from "~~/composables/useDate";
import { SwabStatus } from "~~/composables/useSwab";
import { ExportSwabHistoryResponse } from "~~/composables/useExportSwabHistory";

export type FormType = {
  dateRange: DateRangeInterface | null;
  shift: Shift;
  swabPeriodId: string | null;
  facilityId: string | null;
  facilityItemId: string | null;
  mainSwabAreaId: string | null;
  productId: string | null;
  swabTestCode: string | null;
  swabStatus: SwabStatus;
};

definePageMeta({
  title: "Ai4FoodSafety - Lab report",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const toast = useToast();
const route = useRoute();
const { today, onlyDate, stringToShift } = useDate();
const { getCurrentQuery, updateQueryParams } = useQueryParams();
const {
  tranformRawSwabAreaHistory,
  tranformRawSwabProductHistory,
  api: exportSwabHistoryApi,
} = useExportSwabHistory();
const { api: labApi } = useLab();

const refreshing = ref(false);
const loading = ref(false);
const error = ref(false);
const loaded = ref(false);
const view = ref((route.query.view as string) || "area");
const swabAreaHistories = ref([]);
const swabProductHistories = ref([]);
const totalSwabAreaHistories = ref(0);
const totalSwabProductHistories = ref(0);
const currentDate = today();
const form = reactive<FormType>({
  dateRange: {
    from: (route.query.from as string) || onlyDate(currentDate),
    to: (route.query.to as string) || onlyDate(currentDate),
  },
  shift: stringToShift(route.query.shift as string) || Shift.ALL,
  swabPeriodId: (route.query.swabPeriodId as string) || null,
  facilityId: (route.query.facilityId as string) || null,
  facilityItemId: (route.query.facilityItemId as string) || null,
  mainSwabAreaId: (route.query.mainSwabAreaId as string) || null,
  productId: (route.query.productId as string) || null,
  swabTestCode: (route.query.swabTestCode as string) || null,
  swabStatus: (route.query.swabStatus as SwabStatus) || SwabStatus.ALL,
});

const dateRange = reactive({
  cachedFromDateString: null,
  cachedToDateString: null,
});

const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 20,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});

const displayData = computed(() => {
  let data = [];

  if (view.value === "area") {
    data = swabAreaHistories.value;
  }

  if (view.value === "product") {
    data = swabProductHistories.value;
  }

  return data;
});

const totalDisplayData = computed(() => {
  let total = 0;

  if (view.value === "area") {
    total = totalSwabAreaHistories.value;
  }

  if (view.value === "product") {
    total = totalSwabProductHistories.value;
  }

  return total;
});

// const swabTestData = computed(() =>
//   displayData.value.map(({ swabTest }) => swabTest)
// );

const tableFields = computed(() => {
  let fields: any = [
    {
      key: "ลำดับ",
      label: "ลำดับ",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "5%" },
    },
    {
      key: "วันที่ตรวจ",
      label: "วันที่ตรวจ",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "8%" },
    },
    {
      key: "รหัส",
      label: "รหัส",
      thClass: "text-center",
      tdClass: "text-center",
      thStyle: { width: "5%" },
    },
    {
      key: "กะ",
      label: "กะ",
      thStyle: { width: "5%" },
    },
    {
      key: "ช่วงตรวจ",
      label: "ช่วงตรวจ",
      thStyle: { width: "10%" },
    },
    {
      key: "เครื่อง",
      label: "เครื่อง",
      thStyle: { width: "10%" },
    },
  ];

  if (isView("area")) {
    fields = [
      ...fields,
      {
        key: "จุดตรวจ",
        label: "จุดตรวจ",
        thStyle: { width: "20%" },
      },
    ];
  }

  if (isView("product")) {
    fields = [
      ...fields,
      {
        key: "สินค้า",
        label: "สินค้า",
        thStyle: { width: "20%" },
      },
    ];
  }

  fields = [
    ...fields,
    {
      key: "status",
      label: "ผลตรวจ",
      thClass: "text-center",
      tdClass: "text-center",
      // thStyle: { width: "10%" },
    },
    { key: "เวลาที่ตรวจ", label: "เวลาที่ตรวจ" },
    { key: "ไลน์ที่ตรวจ", label: "ไลน์ที่ตรวจ" },
    {
      key: "bacteriaSpecie",
      label: "สายพันธุ์เชื้อ",
      thClass: "text-center",
      tdClass: "text-center",
      // thStyle: { width: "20%" },
    },
  ];

  return fields;
});

// const paginatedData = computed(() => pagination.paginate(displayData.value));

const canExport = computed(
  () => totalSwabAreaHistories.value > 0 || totalSwabProductHistories.value > 0
);

const isView = (name: string) => {
  return view.value === name;
};

const setView = (name: string) => {
  let query: any = getCurrentQuery();

  view.value = name;

  pagination.resetPage();

  if (query.currentPage && query.currentPage !== "1") {
    query.currentPage = 1;
  }

  updateQueryParams({ ...query, view: name });
};

const resetState = () => {
  loaded.value = false;
  error.value = false;
  swabAreaHistories.value = [];
  swabProductHistories.value = [];
  totalSwabAreaHistories.value = 0;
  totalSwabProductHistories.value = 0;
};

const fetchBaseData = async () => {
  await labApi().loadAllBacteriaWithSpecie();
};

const fetchHistory = async (formValue) => {
  resetState();

  loading.value = true;

  try {
    const fromDateString = formValue.dateRange.from;
    const toDateString = formValue.dateRange.to;

    dateRange.cachedFromDateString = fromDateString;
    dateRange.cachedToDateString = toDateString;

    const swabPlanData: ExportSwabHistoryResponse =
      await exportSwabHistoryApi().fetch(
        {
          ...formValue,
          skip: pagination.offset.value,
          take: pagination.$state.perPage,
        },
        { save: false }
      );

    totalSwabAreaHistories.value = swabPlanData.totalSwabAreaHistories;
    totalSwabProductHistories.value = swabPlanData.totalSwabProductHistories;

    const startIdx = pagination.offset.value;

    if (swabPlanData.swabAreaHistories.length) {
      swabAreaHistories.value = swabPlanData.swabAreaHistories.map(
        (swabAreaHistory, idx) => {
          return {
            ลำดับ: startIdx + idx + 1,
            ...tranformRawSwabAreaHistory(swabAreaHistory),
          };
        }
      );
    }

    if (swabPlanData.swabProductHistories.length) {
      swabProductHistories.value = swabPlanData.swabProductHistories.map(
        (swabProductHistory, idx) => {
          return {
            ลำดับ: startIdx + idx + 1,
            ...tranformRawSwabProductHistory(swabProductHistory),
          };
        }
      );
    }

    loaded.value = true;
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error("โหลดข้อมูลรายงานจุด swab ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
  } finally {
    loading.value = false;
  }
};

const fetchExport = async (
  take = 100,
  skip = 0,
  acc = { swabAreaHistories: [], swabProductHistories: [] }
) => {
  const exportedData: ExportSwabHistoryResponse =
    await exportSwabHistoryApi().fetch(
      {
        ...form,
        skip,
        take,
      },
      { save: false }
    );

  if (
    !exportedData.swabAreaHistories.length &&
    !exportedData.swabProductHistories.length
  ) {
    return acc;
  }

  const startIndexSwabAreaHistory = acc.swabAreaHistories.length;
  const startIndexSwabProductHistory = acc.swabProductHistories.length;

  acc.swabAreaHistories = [
    ...acc.swabAreaHistories,
    ...exportedData.swabAreaHistories.map((swabAreaHistory, idx) => {
      console.log(startIndexSwabAreaHistory + idx + 1);

      return {
        ลำดับ: startIndexSwabAreaHistory + idx + 1,
        ...tranformRawSwabAreaHistory(swabAreaHistory),
      };
    }),
  ];

  acc.swabProductHistories = [
    ...acc.swabProductHistories,
    ...exportedData.swabProductHistories.map((swabProductHistory, idx) => {
      console.log(startIndexSwabProductHistory + idx + 1);

      return {
        ลำดับ: startIndexSwabProductHistory + idx + 1,
        ...tranformRawSwabProductHistory(swabProductHistory),
      };
    }),
  ];

  skip += take;

  return await fetchExport(take, skip, acc);
};

const onFormSubmitted = async () => {
  if (canExport.value) {
    exportSwabHistoryApi().exportReport(form);
  }
};

const refresh = async () => {
  refreshing.value = true;

  try {
    await fetchHistory(form);
  } catch (error) {
  } finally {
    refreshing.value = false;
  }
};

onBeforeMount(async () => {
  await fetchBaseData();

  await fetchHistory(form);
});

watch(
  () => form,
  (formValue) => {
    fetchHistory(formValue);
  },
  { deep: true }
);

watch(
  () => pagination,
  () => {
    fetchHistory(form);
  },
  { deep: true }
);
</script>

<template>
  <div class="page__swab-report mt-4">
    <b-row>
      <b-col>
        <b-form class="w-100">
          <b-container>
            <b-row>
              <b-col>
                <b-row align-h="between">
                  <b-col sm="6" md="8">
                    <h3 class="font-weight-bold">ออกรายงานจุด swab</h3>
                  </b-col>

                  <b-col sm="6" md="4" class="text-end">
                    <b-button
                      variant="light"
                      class="me-3 border"
                      @click="refresh"
                    >
                      <line-md-loading-twotone-loop
                        v-if="refreshing"
                        :style="{ fontSize: '1em' }"
                      />

                      <IcBaselineRefresh v-else />
                    </b-button>

                    <b-button
                      variant="outline-primary"
                      :disabled="!canExport"
                      @click="onFormSubmitted"
                    >
                      <download-icon />
                      <span>นำออกรายงาน</span>
                    </b-button>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>

            <b-row class="mt-3">
              <b-col>
                <b-row class="row-gap-2">
                  <b-col>
                    <swab-test-filter
                      v-model="form"
                      :hidden-state="{
                        date: true,
                        dateRange: false,
                        mainSwabArea: isView('product'),
                        product: isView('area'),
                        swabStatus: false,
                      }"
                      :col-state="{
                        dateRange: 'sm-6 md-4',
                        shift: 'sm-6 md-3',
                        swabPeriod: 'sm-12 md-5',
                        facility: 'sm-12 md-6',
                        facilityItem: 'sm-12 md-6',
                        mainSwabArea: 'sm-12 md-6',
                        product: 'sm-12 md-6',
                        swabStatus: 'sm-12 md-6',
                        swabTestCode: '12',
                      }"
                      :clearable-state="{
                        swabPeriod: true,
                        facility: true,
                        facilityItem: true,
                        mainSwabArea: true,
                        product: true,
                      }"
                      :pagination-state="pagination.$state"
                      placeholder-date="เลือกวันที่ต้องการออกรายงาน"
                    />
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-container>
        </b-form>

        <hr />
      </b-col>
    </b-row>

    <b-row v-if="loading" align-h="center">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </b-row>

    <b-row v-else align-h="center">
      <b-col cols="12">
        <b-row class="my-2">
          <b-button-group size="sm" class="text-center">
            <b-button
              :pressed="isView('area')"
              variant="outline-primary"
              @click="setView('area')"
              >รายการจุดตรวจ Swab</b-button
            >
            <b-button
              :pressed="isView('product')"
              variant="outline-primary"
              @click="setView('product')"
              >รายการตรวจสินค้า</b-button
            >
          </b-button-group>
        </b-row>
      </b-col>
    </b-row>

    <b-row v-if="loaded" class="mt-4">
      <b-col v-if="displayData.length > 0">
        <!-- <swab-test-card-summary-status
          :data="swabTestData"
          :status="form.status"
        >
        </swab-test-card-summary-status> -->

        <b-table
          id="exportedSwabReportTable"
          hover
          small
          caption-top
          responsive
          :fields="tableFields"
          :items="displayData"
        >
          <template #cell(status)="{ item }">
            <badge-swab-status
              :swab-status="(item.status as SwabStatus)"
            ></badge-swab-status>
          </template>

          <template #cell(bacteriaSpecie)="{ item }">
            <badge-bacteria-specie
              :swab-test-id="(item.swabTestId as string)"
            ></badge-bacteria-specie>
          </template>
        </b-table>

        <base-pagination
          v-model="pagination.$state.currentPage"
          :per-page="pagination.$state.perPage"
          :total-rows="totalDisplayData"
          aria-controls="exportedSwabProductTable"
        />
      </b-col>

      <b-col v-else>
        <b-card bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูล
            <span
              v-if="
                dateRange.cachedFromDateString || dateRange.cachedToDateString
              "
            >
              ในวันที่
              {{
                dateRange.cachedFromDateString === dateRange.cachedToDateString
                  ? dateRange.cachedFromDateString
                  : `${dateRange.cachedFromDateString} ถึง ${dateRange.cachedToDateString}`
              }}
            </span>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
