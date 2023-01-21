<script lang="ts" setup>
import { utils, writeFile } from "xlsx";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DownloadIcon from "~icons/carbon/download";
import { DateRangeInterface } from "~~/composables/useDate";
import { GetSwabPlanResponse } from "~~/composables/useSwab";
import { BacteriaStatus } from "~~/composables/useLab";

export type FormType = {
  date: DateRangeInterface | null;
  status: BacteriaStatus;
};

definePageMeta({
  title: "Ai4FoodSafety - Lab report",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const toast = useToast();
const route = useRoute();
const { percentOf } = useMath();
const {
  today,
  onlyDate,
  formatThLocale,
  shiftToAbbreviation,
  updateDateRangeQueryParams,
} = useDate();
const { getCurrentQuery, updateQueryParams } = useQueryParams();
const { getSwabPlan, getSwabAreaById, getSwabPeriodById } = useSwab();
const { getFacilityById } = useFacility();
const {
  getBacteriaBySwabTestId,
  getBacteriaSpecieBySwabTestId,
  getSwabTestById,
  api: labApi,
} = useLab();
const { setWidthColumn } = useXlsx();
// state
const loading = ref(false);
const error = ref(false);
const loaded = ref(false);
const includeBacteriaSpecies = true;
const view = ref((route.query.view as string) || "area");
const swabAreaHistories = ref([]);
const swabProductHistories = ref([]);
const currentDate = today();
const form = reactive<FormType>({
  date: {
    from: (route.query.from as string) || onlyDate(currentDate),
    to: (route.query.to as string) || onlyDate(currentDate),
  },
  status: (route.query.status as BacteriaStatus) || BacteriaStatus.ALL,
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

const countPendingRecord = computed(() => {
  return displayData.value.reduce((acc, data) => {
    if (data["ผลตรวจ"] === "รอผล") {
      acc += 1;
    }

    return acc;
  }, 0);
});

const countNormalRecord = computed(() => {
  return displayData.value.reduce((acc, data) => {
    if (data["ผลตรวจ"] === "ปกติ") {
      acc += 1;
    }

    return acc;
  }, 0);
});

const countDetectedBacteriaRecord = computed(() => {
  return displayData.value.reduce((acc, data) => {
    if (data["ผลตรวจ"] === "พบเชื้อ") {
      acc += 1;
    }

    return acc;
  }, 0);
});

const percentDetectedBacteria = computed(() => {
  let percent = 0;

  if (displayData.value.length > 0) {
    const countRecordedData =
      displayData.value.length - countPendingRecord.value;

    percent = percentOf(countDetectedBacteriaRecord.value, countRecordedData);
  }

  return percent;
});

const percentNormal = computed(() => {
  let percent = 0;

  if (displayData.value.length > 0) {
    const countRecordedData =
      displayData.value.length - countPendingRecord.value;

    percent = percentOf(countNormalRecord.value, countRecordedData);
  }

  return percent;
});

const tableFields = computed(() => {
  let fields = [
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
      thStyle: { width: "10%" },
    },
    {
      key: "รหัส",
      label: "รหัส",
      thClass: "text-center",
      tdClass: "text-center",
      thStyle: { width: "10%" },
    },
    {
      key: "กะ",
      label: "กะ",
      thStyle: { width: "5%" },
    },
    { key: "ช่วงตรวจ", label: "ช่วงตรวจ", thStyle: { width: "10%" } },
  ];

  if (isView("area")) {
    fields = [
      ...fields,
      { key: "เครื่อง", label: "เครื่อง", thStyle: { width: "10%" } },
      {
        key: "จุดตรวจ",
        label: "จุดตรวจ",
        thStyle: { width: includeBacteriaSpecies ? "20%" : "50%" },
      },
    ];
  }

  if (includeBacteriaSpecies) {
    fields = [
      ...fields,
      {
        key: "status",
        label: "ผลตรวจ",
        thClass: "text-center",
        tdClass: "text-center",
        thStyle: { width: "10%" },
      },
      {
        key: "bacteriaSpecie",
        label: "สายพันธุ์เชื้อ",
        thClass: "text-center",
        tdClass: "text-center",
        thStyle: { width: "20%" },
      },
    ];
  }

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
    const fromDateString = formValue.date.from;
    const toDateString = formValue.date.to;
    const bacteriaStatus = formValue.status;

    dateRange.cachedFromDateString = fromDateString;
    dateRange.cachedToDateString = toDateString;

    const swabPlanData: GetSwabPlanResponse = await getSwabPlan(
      fromDateString,
      toDateString,
      includeBacteriaSpecies,
      bacteriaStatus
    );

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

          const swabTest = getSwabTestById(el.swabTest.id);

          const isRecorded = swabTest.swabTestRecordedAt !== null;
          const bacteria = getBacteriaBySwabTestId(swabTest.id);

          const hasBacteria = bacteria && bacteria.length > 0;

          const bacteriaSpecies = getBacteriaSpecieBySwabTestId(swabTest.id);

          const hasBacteriaSpecie =
            hasBacteria && bacteriaSpecies && bacteriaSpecies.length > 0;

          let bacteriaSpecieName = hasBacteriaSpecie
            ? bacteriaSpecies
                .map(({ bacteriaSpecieName }) => bacteriaSpecieName)
                .join(",")
            : "";

          let status = "รอผล";

          if (isRecorded) {
            status = hasBacteria ? "พบเชื้อ" : "ปกติ";
          }

          return {
            ลำดับ: idx + 1,
            วันที่ตรวจ: formatThLocale(new Date(el.swabAreaDate), "ddMMyy"),
            รหัส: el.swabTest.swabTestCode,
            กะ: el.shift ? shiftToAbbreviation(el.shift) : "",
            ช่วงตรวจ: swabPeriod ? swabPeriod.swabPeriodName : "",
            เครื่อง: facilityName,
            จุดตรวจ: swabArea.swabAreaName,
            ผลตรวจ: status,
            สายพันธุ์เชื้อ: bacteriaSpecieName,
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

          const swabTest = getSwabTestById(el.swabTest.id);

          const isRecorded = swabTest.swabTestRecordedAt !== null;
          const bacteria = getBacteriaBySwabTestId(swabTest.id);

          const hasBacteria = bacteria && bacteria.length > 0;

          let status = "รอผล";

          if (isRecorded) {
            status = hasBacteria ? "พบเชื้อ" : "ปกติ";
          }

          const bacteriaSpecies = getBacteriaSpecieBySwabTestId(swabTest.id);

          const hasBacteriaSpecie =
            hasBacteria && bacteriaSpecies && bacteriaSpecies.length > 0;

          let bacteriaSpecieName = hasBacteriaSpecie
            ? bacteriaSpecies
                .map(({ bacteriaSpecieName }) => bacteriaSpecieName)
                .join(",")
            : "";

          return {
            ลำดับ: idx + 1,
            วันที่ตรวจ: formatThLocale(new Date(el.swabProductDate), "ddMMyy"),
            รหัส: el.swabTest.swabTestCode,
            กะ: el.shift ? shiftToAbbreviation(el.shift) : "",
            ช่วงตรวจ: swabPeriod ? swabPeriod.swabPeriodName : "",
            ผลตรวจ: status,
            สายพันธุ์เชื้อ: bacteriaSpecieName,
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

    const additionalHeaders = includeBacteriaSpecies
      ? ["ผลตรวจ", "สายพันธุ์เชื้อ"]
      : [];

    if (swabAreaHistories.value.length) {
      const wsSwabAreaHistoryHeaders = [
        "ลำดับ",
        "วันที่ตรวจ",
        "รหัส",
        "กะ",
        "ช่วงตรวจ",
        "เครื่อง",
        "จุดตรวจ",
        ...additionalHeaders,
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
        ...additionalHeaders,
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

    writeFile(
      wb,
      `รายงานจุดswab-${
        fromDateString === toDateString
          ? fromDateString
          : `${fromDateString}-${toDateString}`
      } .xlsx`
    );
  }
};

onBeforeMount(async () => {
  if (includeBacteriaSpecies) {
    await labApi().loadAllBacteriaWithSpecie();
  }
});

watch(
  () => form.date,
  (formDate) => {
    updateDateRangeQueryParams(formDate);
  },
  { immediate: true }
);

watch(
  () => form.status,
  (formBateriaStatus) => {
    let query: any = getCurrentQuery();

    updateQueryParams({
      ...query,
      status: formBateriaStatus,
    });
  }
);

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
    <b-row class="mb-4">
      <b-col>
        <b-form class="w-100" @submit="onFormSubmitted">
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
                  <b-col md="6" xl="4">
                    <div class="input-group align-items-baseline">
                      <label for="date" class="form-label d-block min-w-75px"
                        >วันที่</label
                      >

                      <date-picker-range
                        v-model="form.date"
                        class="col"
                        placeholder="เลือกวันที่ต้องการออกรายงาน"
                      />
                    </div>
                  </b-col>
                  <b-col sm="8" md="3" xl="4">
                    <div class="input-group align-items-baseline">
                      <label
                        for="bacteria-status"
                        class="form-label d-block min-w-75px"
                        >ผลตรวจ</label
                      >

                      <swab-test-form-select-bacteria-status
                        id="bacteria-status"
                        class="col"
                        show-all
                        v-model="form.status"
                      ></swab-test-form-select-bacteria-status>
                    </div>
                  </b-col>

                  <b-col sm="4" md="3" xl="4" class="text-end">
                    <b-button
                      variant="outline-primary"
                      type="submit"
                      :disabled="!canExport"
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
      </b-col>
    </b-row>

    <b-row v-if="loading" align-h="center">
      <b-col>
        <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
      </b-col>
    </b-row>

    <b-row v-else align-h="center">
      <b-col v-if="loaded" cols="12">
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

    <b-row v-show="loaded" class="mt-4">
      <b-col>
        <div v-if="displayData.length > 0">
          <b-card-group deck>
            <b-card align="center">
              <b-card-text><h4>ทั้งหมด</h4></b-card-text>
              <b-card-text>{{ displayData.length }} รายการ</b-card-text>
            </b-card>

            <b-card
              v-if="form.status === BacteriaStatus.ALL"
              border-variant="primary"
              body-bg-variant="primary"
              body-text-variant="white"
              align="center"
            >
              <b-card-text><h4>รอผล</h4></b-card-text>
              <b-card-text>{{ countPendingRecord }} รายการ</b-card-text>
            </b-card>

            <b-card
              v-if="form.status === BacteriaStatus.ALL"
              border-variant="success"
              body-bg-variant="success"
              body-text-variant="white"
              align="center"
            >
              <b-card-text><h4>ปกติ</h4></b-card-text>
              <b-card-text>
                {{ countNormalRecord }} รายการ ({{ percentNormal }}%)
              </b-card-text>
            </b-card>

            <b-card
              v-if="form.status === BacteriaStatus.ALL"
              border-variant="danger"
              body-bg-variant="danger"
              body-text-variant="white"
              align="center"
            >
              <b-card-text><h4>พบเชื้อ</h4></b-card-text>
              <b-card-text>
                {{ countDetectedBacteriaRecord }} รายการ ({{
                  percentDetectedBacteria
                }}%)
              </b-card-text>
            </b-card>

            <!-- <b-card
              border-variant="danger"
              header-border-variant="danger"
              align="center"
            >
              <b-card-text><h3>เปอร์เซ็นต์พบเชื้อ</h3></b-card-text>
              <b-card-text
                ><h5>{{ percentDetectedBacteria }}%</h5></b-card-text
              >
            </b-card> -->
          </b-card-group>

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
        </div>

        <b-card v-else bg-variant="light">
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
    </b-row>
  </div>
</template>
