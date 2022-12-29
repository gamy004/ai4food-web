<script lang="ts" setup>
import SwabPlan from "~~/models/SwabPlan";
import { utils, writeFile } from "xlsx";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DownloadIcon from "~icons/carbon/download";
import { DateRangeInterface } from "~~/composables/useDate";

export type FormType = {
  date: DateRangeInterface | null;
};

definePageMeta({
  title: "Ai4FoodSafety - Swab report",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const toast = useToast();
const route = useRoute();
const {
  today,
  onlyDate,
  formatThLocale,
  shiftToAbbreviation,
  updateDateRangeQueryParams,
} = useDate();
const { getCurrentQuery, updateQueryParams } = useQueryParams();
const { getSwabPlan } = useSwab();
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
  date: {
    from: (route.query.from as string) || onlyDate(currentDate),
    to: (route.query.to as string) || onlyDate(currentDate),
  },
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

const tableFields = computed(() => {
  let fields = [
    { key: "ลำดับ", label: "ลำดับ", thStyle: { width: "5%" } },
    { key: "วันที่ตรวจ", label: "วันที่ตรวจ", thStyle: { width: "10%" } },
    { key: "รหัส", label: "รหัส", thStyle: { width: "10%" } },
    { key: "กะ", label: "กะ", thStyle: { width: "5%" } },
    { key: "ช่วงตรวจ", label: "ช่วงตรวจ", thStyle: { width: "10%" } },
  ];

  if (isView("area")) {
    fields = [
      ...fields,
      { key: "เครื่อง", label: "เครื่อง", thStyle: { width: "10%" } },
      { key: "จุดตรวจ", label: "จุดตรวจ", thStyle: { width: "50%" } },
    ];
  }

  return fields;
});

const paginatedData = computed(() => pagination.paginate(displayData.value));

const canExport = computed(
  () => swabAreaHistories.value.length || swabProductHistories.value.length
);

const isView = (name: string) => view.value === name;
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

const onFormDateChanged = async (formDate) => {
  resetState();

  loading.value = true;

  try {
    const fromDateString = formDate.from;
    const toDateString = formDate.to;

    dateRange.cachedFromDateString = fromDateString;
    dateRange.cachedToDateString = toDateString;

    const swabPlanData: SwabPlan = await getSwabPlan(
      fromDateString,
      toDateString
    );

    if (swabPlanData.swabAreaHistories.length) {
      swabAreaHistories.value = swabPlanData.swabAreaHistories.map(
        (el, idx) => {
          const swabArea = swabPlanData.swabAreas.find(
            (item) => item.id === el.swabAreaId
          );
          // console.log(swabArea)
          const swabPeriodName = swabPlanData.swabPeriods.find(
            (item) => item.id === el.swabPeriodId
          );
          const mainswabArea = swabArea.mainSwabAreaId
            ? swabPlanData.swabAreas.find(
                (item) => item.id == swabArea.mainSwabAreaId
              ).swabAreaName
            : swabArea.swabAreaName;
          const facility = swabArea.facilityId
            ? swabPlanData.facilities.find(
                (item) => item.id == swabArea.facilityId
              ).facilityName
            : "";

          return {
            ลำดับ: idx + 1,
            วันที่ตรวจ: formatThLocale(new Date(el.swabAreaDate), "ddMMyy"),
            รหัส: el.swabTest.swabTestCode,
            กะ: el.shift ? shiftToAbbreviation(el.shift) : "",
            ช่วงตรวจ: swabPeriodName ? swabPeriodName.swabPeriodName : "",
            เครื่อง: facility,
            จุดตรวจ: mainswabArea,
          };
        }
      );
    }

    if (swabPlanData.swabProductHistories.length) {
      swabProductHistories.value = swabPlanData.swabProductHistories.map(
        (el, idx) => {
          const swabPeriodName = swabPlanData.swabPeriods.find(
            (item) => item.id === el.swabPeriodId
          );

          return {
            ลำดับ: idx + 1,
            วันที่ตรวจ: formatThLocale(new Date(el.swabProductDate), "ddMMyy"),
            รหัส: el.swabTest.swabTestCode,
            กะ: el.shift ? shiftToAbbreviation(el.shift) : "",
            ช่วงตรวจ: swabPeriodName ? swabPeriodName.swabPeriodName : "",
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
      let wsSwabAreaHistory = utils.json_to_sheet(swabAreaHistories.value);

      wsSwabAreaHistory = setWidthColumn(
        wsSwabAreaHistory,
        ["ลำดับ", "วันที่ตรวจ", "รหัส", "กะ", "ช่วงตรวจ", "เครื่อง", "จุดตรวจ"],
        swabAreaHistories.value,
        { ลำดับ: 10, กะ: 10 }
      );

      utils.book_append_sheet(wb, wsSwabAreaHistory, "รายการจุดตรวจ swab");
    }

    if (swabProductHistories.value.length) {
      let wsSwabProductHistory = utils.json_to_sheet(
        swabProductHistories.value
      );

      wsSwabProductHistory = setWidthColumn(
        wsSwabProductHistory,
        ["ลำดับ", "วันที่ตรวจ", "รหัส", "กะ", "ช่วงตรวจ"],
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

watch(
  () => form.date,
  (formDate) => {
    // console.log("watch form.date value", formDate);

    if (formDate) {
      onFormDateChanged(formDate);
      updateDateRangeQueryParams(formDate);
    } else {
      resetState();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="page__swab-report mt-4">
    <b-row class="mb-3">
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

            <b-row class="row-gap-2 mt-3">
              <b-col cols="8" md="6" lg="4">
                <div class="input-group align-items-baseline">
                  <label for="date" class="form-label d-block min-w-75px"
                    >วันที่</label
                  >

                  <date-picker-range
                    v-model="form.date"
                    class="col me-3"
                    placeholder="เลือกวันที่ต้องการออกรายงาน"
                  />
                </div>
              </b-col>

              <b-col class="text-end">
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
        <b-row>
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
          <b-table
            id="exportedSwabProductTable"
            hover
            small
            caption-top
            responsive
            :fields="tableFields"
            :items="paginatedData"
          />

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
