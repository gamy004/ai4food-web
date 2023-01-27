<script lang="ts" setup>
import { utils, writeFile } from "xlsx";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DownloadIcon from "~icons/carbon/download";
import { Shift, DateRangeInterface } from "~~/composables/useDate";
import { GetSwabPlanResponse } from "~~/composables/useSwab";
import { SwabStatus, SwabStatusMapper } from "~~/composables/useSwab";

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
// const { isPage, goTo } = useNavigation();
const toast = useToast();
const route = useRoute();
const {
  today,
  onlyDate,
  formatThLocale,
  formatTimeThLocale,
  shiftToAbbreviation,
  stringToShift,
  // updateDateRangeQueryParams,
} = useDate();
const { getCurrentQuery, updateQueryParams } = useQueryParams();
const { getSwabPlan, getSwabAreaById, getSwabPeriodById } = useSwab();
const { getFacilityById, getFacilityItemById } = useFacility();
const {
  // getBacteriaBySwabTestId,
  // getBacteriaSpecieBySwabTestId,
  getSwabTestById,
  api: labApi,
} = useLab();
const { setWidthColumn } = useXlsx();
// state
const loading = ref(false);
const error = ref(false);
const loaded = ref(false);
const view = ref((route.query.view as string) || "area");
const swabAreaHistories = ref([]);
const swabProductHistories = ref([]);
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
  ];

  if (isView("area")) {
    fields = [
      ...fields,
      {
        key: "เครื่อง",
        label: "เครื่อง",
        // thStyle: { width: "10%" },
      },
      {
        key: "จุดตรวจ",
        label: "จุดตรวจ",
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

const paginatedData = computed(() => pagination.paginate(displayData.value));

const canExport = computed(
  () => swabAreaHistories.value.length || swabProductHistories.value.length
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
};

const fetch = async (formValue) => {
  resetState();

  loading.value = true;

  try {
    const fromDateString = formValue.dateRange.from;
    const toDateString = formValue.dateRange.to;

    dateRange.cachedFromDateString = fromDateString;
    dateRange.cachedToDateString = toDateString;

    const swabPlanData: GetSwabPlanResponse = await getSwabPlan(formValue);

    if (swabPlanData.swabAreaHistories.length) {
      swabAreaHistories.value = swabPlanData.swabAreaHistories.map(
        (el, idx) => {
          const swabArea = getSwabAreaById(el.swabAreaId);

          const swabPeriod = getSwabPeriodById(el.swabPeriodId);

          let facilityName = "";

          if (swabArea) {
            const facility = getFacilityById(swabArea.facilityId);

            facilityName = facility.facilityName;
          }

          const facilityItem = getFacilityItemById(el.facilityItemId);

          const swabTest = getSwabTestById(el.swabTest.id);

          return {
            ลำดับ: idx + 1,
            วันที่ตรวจ: formatThLocale(new Date(el.swabAreaDate), "ddMMyy"),
            เวลาที่ตรวจ: el.swabAreaSwabedAt
              ? formatTimeThLocale(el.swabAreaSwabedAt)
              : "",
            ไลน์ที่ตรวจ: facilityItem ? facilityItem.facilityItemName : "",
            รหัส: el.swabTest.swabTestCode,
            กะ: el.shift ? shiftToAbbreviation(el.shift) : "",
            ช่วงตรวจ: swabPeriod ? swabPeriod.swabPeriodName : "",
            เครื่อง: facilityName,
            จุดตรวจ: swabArea.swabAreaName,
            ผลตรวจ: swabTest.status,
            สายพันธุ์เชื้อ: swabTest.bacteriaNames,
            swabTest,
            swabTestId: swabTest.id,
          };
        }
      );
    }

    if (swabPlanData.swabProductHistories.length) {
      swabProductHistories.value = swabPlanData.swabProductHistories.map(
        (el, idx) => {
          const swabPeriod = getSwabPeriodById(el.swabPeriodId);

          const facilityItem = getFacilityItemById(el.facilityItemId);

          const swabTest = getSwabTestById(el.swabTest.id);

          return {
            ลำดับ: idx + 1,
            วันที่ตรวจ: formatThLocale(new Date(el.swabProductDate), "ddMMyy"),
            รหัส: el.swabTest.swabTestCode,
            เวลาที่ตรวจ: el.swabAreaSwabedAt
              ? formatTimeThLocale(el.swabAreaSwabedAt)
              : "",
            ไลน์ที่ตรวจ: facilityItem ? facilityItem.facilityItemName : "",
            กะ: el.shift ? shiftToAbbreviation(el.shift) : "",
            ช่วงตรวจ: swabPeriod ? swabPeriod.swabPeriodName : "",
            ผลตรวจ: swabTest.status,
            สายพันธุ์เชื้อ: swabTest.bacteriaNames,
            swabTest,
            swabTestId: swabTest.id,
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

const onFormSubmitted = () => {
  if (canExport.value) {
    const wb = utils.book_new();

    const fromDateString = dateRange.cachedFromDateString;
    const toDateString = dateRange.cachedToDateString;

    if (swabAreaHistories.value.length) {
      const wsSwabAreaHistoryHeaders = [
        "ลำดับ",
        "วันที่ตรวจ",
        "รหัส",
        "กะ",
        "ช่วงตรวจ",
        "เครื่อง",
        "จุดตรวจ",
        "ผลตรวจ",
        "เวลาที่ตรวจ",
        "ไลน์ที่ตรวจ",
        "สายพันธุ์เชื้อ",
      ];

      let wsSwabAreaHistory = utils.json_to_sheet(
        swabAreaHistories.value.map((swabAreaHistory) => {
          return wsSwabAreaHistoryHeaders.reduce((acc, header) => {
            acc[header] = swabAreaHistory[header];

            return acc;
          }, {});
        })
      );

      wsSwabAreaHistory = setWidthColumn(
        wsSwabAreaHistory,
        wsSwabAreaHistoryHeaders,
        swabAreaHistories.value,
        { ลำดับ: 10, กะ: 10 }
      );

      utils.book_append_sheet(wb, wsSwabAreaHistory, "รายการจุดตรวจ swab");
    }

    if (swabProductHistories.value.length) {
      const wsSwabProductHistoryHeaders = [
        "ลำดับ",
        "วันที่ตรวจ",
        "รหัส",
        "กะ",
        "ช่วงตรวจ",
        "ผลตรวจ",
        "เวลาที่ตรวจ",
        "ไลน์ที่ตรวจ",
        "สายพันธุ์เชื้อ",
      ];

      let wsSwabProductHistory = utils.json_to_sheet(
        swabProductHistories.value.map((swabProductHistory) => {
          return wsSwabProductHistoryHeaders.reduce((acc, header) => {
            acc[header] = swabProductHistory[header];

            return acc;
          }, {});
        })
      );

      wsSwabProductHistory = setWidthColumn(
        wsSwabProductHistory,
        wsSwabProductHistoryHeaders,
        swabProductHistories.value,
        { ลำดับ: 10, กะ: 10 }
      );

      utils.book_append_sheet(wb, wsSwabProductHistory, "รายการตรวจสินค้า");
    }

    let fileNames = [
      "รายงานจุดswab",
      fromDateString === toDateString
        ? fromDateString
        : `${fromDateString}-${toDateString}`,
    ];

    if (form.swabStatus !== SwabStatus.ALL) {
      fileNames.push(SwabStatusMapper[form.swabStatus]);
    }

    console.log(fileNames);

    writeFile(wb, `${fileNames.join("_")}.xlsx`);
  }
};

onBeforeMount(async () => {
  await labApi().loadAllBacteriaWithSpecie();
});

// watch(
//   () => form.date,
//   (formDate) => {
//     updateDateRangeQueryParams(formDate);
//   },
//   { immediate: true }
// );

watch(
  () => form,
  (formValue) => {
    fetch(formValue);
  },
  { deep: true, immediate: true }
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
                <b-row>
                  <h3 class="font-weight-bold">ออกรายงานจุด swab</h3>
                </b-row>
                <!-- <b-row>
                      <h6 v-if="report" class="font-weight-normal">รายงานจุดตรวจ | ข้อมูลล่าสุด {{ report }}</h6>
                      <h6 v-else class="font-weight-normal">รายงานจุดตรวจ</h6>
                  </b-row> -->
              </b-col>

              <!-- <b-col sm="6" class="text-end">
                <div
                  class="d-flex justify-content-between justify-content-sm-end"
                >
                  <date-picker-range
                    v-model="form.date"
                    class="col me-3"
                    placeholder="เลือกวันที่ต้องการออกรายงาน"
                    clearable
                  />

                  <b-button
                    variant="outline-primary"
                    type="submit"
                    :disabled="!canExport"
                  >
                    <download-icon />
                    <span>ดาว์นโหลดรายงาน</span>
                  </b-button>
                </div>
              </b-col> -->
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
                        mainSwabArea: false,
                        product: false,
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
                        swabTestCode: 'sm-12 md-6',
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
                <b-row class="row-gap-2 mt-3">
                  <!-- <b-col md="6" xl="4">
                    <div class="input-group align-items-baseline">
                      <label for="date" class="form-label d-block min-w-75px"
                        >วันที่</label
                      >

                      <date-picker-range
                        v-model="form.dateRange"
                        class="col"
                        placeholder="เลือกวันที่ต้องการออกรายงาน"
                      />
                    </div>
                  </b-col> -->

                  <!-- <b-col sm="8" md="3" xl="4">
                    <div class="input-group align-items-baseline">
                      <label
                        for="swab-status"
                        class="form-label d-block min-w-75px"
                        >ผลตรวจ</label
                      >

                      <swab-status-select
                        id="swab-status"
                        class="col"
                        show-all
                        v-model="form.status"
                      ></swab-status-select>
                    </div>
                  </b-col> -->

                  <b-col sm="4" md="3" xl="4" class="text-end">
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
          </b-container>
        </b-form>

        <hr />
      </b-col>
    </b-row>

    <b-row v-if="loading" align-h="center">
      <b-col>
        <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
      </b-col>
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

    <b-row>
      <b-col v-if="displayData.length > 0">
        <!-- <swab-test-card-summary-status
          :data="swabTestData"
          :status="form.status"
        >
        </swab-test-card-summary-status> -->

        <b-table
          class="mt-4"
          id="exportedSwabReportTable"
          hover
          small
          caption-top
          responsive
          :fields="tableFields"
          :items="paginatedData"
        >
          <template #cell(status)="{ item }">
            <badge-bacteria-status
              :swab-test="item.swabTest"
            ></badge-bacteria-status>
          </template>

          <template #cell(bacteriaSpecie)="{ item }">
            <badge-bacteria-specie
              :swab-test-id="item.swabTestId"
            ></badge-bacteria-specie>
          </template>
        </b-table>

        <base-pagination
          v-model="pagination.$state.currentPage"
          :per-page="pagination.$state.perPage"
          :total-rows="displayData.length"
          aria-controls="exportedSwabProductTable"
        />
      </b-col>

      <b-col v-else>
        <b-card bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูลรายการตรวจสินค้า
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

      <!-- <b-col v-if="isView('area')">
        <swab-test-table-area
          v-model="form"
          :pagination="pagination"
          read-only
        ></swab-test-table-area>
      </b-col>

      <b-col v-if="isView('product')">
        <swab-test-table-product
          v-model="form"
          :pagination="pagination"
          read-only
        ></swab-test-table-product>
      </b-col> -->
    </b-row>
  </div>
</template>
