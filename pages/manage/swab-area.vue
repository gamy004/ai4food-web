<script lang="ts" setup>
import { useToast } from "vue-toastification";
import { utils, writeFile } from "xlsx";
import Datepicker from "@vuepic/vue-datepicker";
import { ShiftMapper } from "~~/composables/useDate";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DownloadIcon from "~icons/carbon/download";
import SwabPlan from "~~/models/SwabPlan";

definePageMeta({
  title: "Ai4FoodSafety - Swab Area",
  middleware: [
    "auth"
  ],
  canGoBack: true,
  fallBackRedirect: "/"
});
const toast = useToast();
const { onlyDate,today } = useDate();
const { getSwabPlan } = useSwab();

const loading = ref(false);
const error = ref(false);
const date = ref(today());
const hasResults = ref(false);
const results = ref([]);
const perPage = ref(100);
const currentPage = ref(1);

function reportMixin_setWidthColumn(ws, header, data, fixedLengthHeader = {}) {
  const objectMaxLength = header.map(h => fixedLengthHeader[h] || h.length);

  for (let i = 0; i < data.length; i++) {
    header.forEach((key, j) => {
      if (!fixedLengthHeader[key]) {
        const valueString = data[i][key];
        objectMaxLength[j] =
          objectMaxLength[j] >= valueString.length
            ? objectMaxLength[j]
            : valueString.length;
      }
    });
  }

  ws["!cols"] = objectMaxLength.map(obj => ({ width: obj }));

  return ws;
}

const dateRange = reactive({
  from: null,
  to: null,
  cachedFromDateString: null,
  cachedToDateString: null
});

const fromDateString = computed(() => dateRange.from !== null ? onlyDate(dateRange.from) : "");

const toDateString = computed(() => dateRange.to !== null ? onlyDate(dateRange.to) : "");

watch(date, (dateValue) => {
  if (dateValue !== null) {
    dateRange.from = dateValue[0];
    dateRange.to = dateValue[1] !== null ? dateValue[1] : dateValue[0];
  }
});


async function onFormSubmitted() {
  hasResults.value = false;
  error.value = false;
  loading.value = true;

  try {
    results.value = [];

    dateRange.cachedFromDateString = fromDateString.value;
    dateRange.cachedToDateString = toDateString.value;

    const swabPlanData: SwabPlan = await getSwabPlan(fromDateString.value, toDateString.value);
    // console.log(swabPlanData)
    if (swabPlanData.swabAreaHistories.length) {
      const swabAreaHistories = swabPlanData.swabAreaHistories;
      // let updatedDt = new Date(swabAreaHistories[0].updatedAt)
      // report.value = updatedDt.getDate() + '/' + (updatedDt.getMonth() + 1) + '/' + updatedDt.getFullYear()
      swabAreaHistories.forEach((el, idx) => {
        const swabArea = swabPlanData.swabAreas.find(item => item.id === el.swabAreaId);
        // console.log(swabArea)
        const swabPeriodName = swabPlanData.swabPeriods.find(item => item.id === el.swabPeriodId);
        const mainswabArea = swabArea.mainSwabAreaId ? swabPlanData.swabAreas.find(item => item.id == swabArea.mainSwabAreaId).swabAreaName : swabArea.swabAreaName;
        const facility = swabArea.facilityId ? swabPlanData.facilities.find(item => item.id == swabArea.facilityId).facilityName : "";
        results.value.push({
          ลำดับ: idx + 1,
          วันที่ตรวจ: el.swabAreaDate,
          เครื่อง: facility,
          จุดตรวจหลัก: mainswabArea,
          รหัส: el.swabTest.swabTestCode,
          ช่วงตรวจ: swabPeriodName ? swabPeriodName.swabPeriodName : "",
          กะ: el.shift ? ShiftMapper[el.shift] : ""
        });
      });
    }

    hasResults.value = results.value.length > 0;

    if (hasResults.value) {
      let ws = utils.json_to_sheet(results.value);

      const wb = utils.book_new();

      ws = reportMixin_setWidthColumn(ws, ["ลำดับ", "วันที่ตรวจ", "เครื่อง", "จุดตรวจหลัก", "รหัส", "ช่วงตรวจ", "กะ"], results.value, { ลำดับ: 10 });

      utils.book_append_sheet(wb, ws, "รายการจุดตรวจ swab");
      writeFile(wb, `รายการจุดตรวจswab_${fromDateString.value === toDateString.value ? fromDateString.value : `${fromDateString.value}-${toDateString.value}`} .xlsx`);

      toast.success("โหลดข้อมูล จุด swab สำเร็จ", { timeout: 1000 });
    }
  } catch (e) {
    console.log(e);

    error.value = true;
    toast.error("โหลดข้อมูล จุด swab ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { timeout: 1000 });
  } finally {
    loading.value = false;
  }
}

const filteredData = computed(
  () => results.value.filter((_, idx) => {
    return (idx >= (currentPage.value - 1) * perPage.value) && (idx < currentPage.value * perPage.value);
  })
);

</script>
    
<template>
  <div class="page__swab-report">
    <b-form class="w-100" @submit="onFormSubmitted">
      <b-container>
        <b-row>
          <b-col cols="7">
            <b-row>
              <h3 class="font-weight-bold">
                รายการจุดตรวจ swab/ ATK
              </h3>
            </b-row>
          </b-col>
          <b-col>
            <b-button variant="outline-primary">
              เพิ่มรายการจุดตรวจ
            </b-button>
          </b-col>

          <b-col>
            <b-button variant="outline-primary" type="submit">
              <download-icon />
            </b-button>
          </b-col>
        </b-row>
        <b-row>
          <div v-if="loading" class="col text-center mt-5">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
          </div>
          <div v-if="hasResults">
            <b-table id="result-table" hover small caption-top responsive :items="filteredData" />

            <b-pagination v-model="currentPage" align="center" :total-rows="results.length" :per-page="perPage"
              aria-controls="result-table" />
          </div>

          <p v-else>
            ไม่พบข้อมูลรายการจุดตรวจ swab ในวันที่ {{ dateRange.cachedFromDateString ===
            dateRange.cachedToDateString ? dateRange.cachedFromDateString :
            `${dateRange.cachedFromDateString} ถึง ${dateRange.cachedToDateString}`
            }}
          </p>
        </b-row>
      </b-container>
    </b-form>

  </div>
</template>
<style module>

</style>
    