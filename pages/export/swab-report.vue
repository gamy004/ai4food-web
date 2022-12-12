<script lang="ts" setup>
import SwabPlan from "~~/models/SwabPlan";
import { utils, writeFile } from "xlsx";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DownloadIcon from "~icons/carbon/download";

definePageMeta({
  title: "Ai4FoodSafety - Swab report",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const toast = useToast();
const route = useRoute();
const { today, onlyDate, stringToShift, formatThLocale, shiftToAbbreviation } =
  useDate();
const { isPage, goTo } = useNavigation();
const { getSwabPlan } = useSwab();
const { getCurrentQuery } = useQueryParams();

// state
const loading = ref(false);
const error = ref(false);
const loaded = ref(false);
const swabAreaHistories = ref([]);
const swabProductHistories = ref([]);
const results = ref([]);
const currentDate = today();
const form = reactive({
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

function reportMixin_setWidthColumn(ws, header, data, fixedLengthHeader = {}) {
  const objectMaxLength = header.map((h) => fixedLengthHeader[h] || h.length);

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

  ws["!cols"] = objectMaxLength.map((obj) => ({ width: obj }));

  return ws;
}

const switchPage = async (name: string) => {
  let query: any = getCurrentQuery();

  if (query.currentPage && query.currentPage !== "1") {
    query.currentPage = 1;
  }

  if (pagination.$state.currentPage !== 1) {
    pagination.$state.currentPage = 1;
  }

  await goTo({ name, query });
};

async function onFormSubmitted() {
  loaded.value = false;
  error.value = false;
  loading.value = true;

  try {
    results.value = [];

    const fromDateString = form.date.from;
    const toDateString = form.date.to;

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

    loaded.value = true;

    if (swabAreaHistories.value.length || swabProductHistories.value.length) {
      const wb = utils.book_new();

      if (swabAreaHistories.value) {
        let ws = utils.json_to_sheet(swabAreaHistories.value);

        ws = reportMixin_setWidthColumn(
          ws,
          [
            "ลำดับ",
            "วันที่ตรวจ",
            "รหัส",
            "กะ",
            "ช่วงตรวจ",
            "เครื่อง",
            "จุดตรวจ",
          ],
          results.value,
          { ลำดับ: 10 }
        );

        utils.book_append_sheet(wb, ws, "รายการจุดตรวจ swab");
      }

      writeFile(
        wb,
        `รายการจุดตรวจswab_${
          fromDateString === toDateString
            ? fromDateString
            : `${fromDateString}-${toDateString}`
        } .xlsx`
      );

      toast.success("โหลดข้อมูล จุด swab สำเร็จ", { timeout: 1000 });
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error("โหลดข้อมูล จุด swab ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
  } finally {
    loading.value = false;
  }
}

const displayData = computed(() => {
  let data = [];

  if (isPage("export-swab-report-area")) {
    data = swabAreaHistories.value;
  }

  if (isPage("export-swab-report-product")) {
    data = swabProductHistories.value;
  }

  return data;
});
</script>

<template>
  <div class="page__swab-report mt-4">
    <b-row class="mb-3">
      <b-col>
        <b-form class="w-100" @submit="onFormSubmitted">
          <b-container>
            <b-row>
              <b-col cols="7">
                <b-row>
                  <h3 class="font-weight-bold">รายการจุดตรวจ swab</h3>
                </b-row>
                <!-- <b-row>
                      <h6 v-if="report" class="font-weight-normal">รายงานจุดตรวจ | ข้อมูลล่าสุด {{ report }}</h6>
                      <h6 v-else class="font-weight-normal">รายงานจุดตรวจ</h6>
                  </b-row> -->
              </b-col>
              <b-col cols="3">
                <date-picker-range v-model="form.date" class="col" />
              </b-col>
              <b-col>
                <b-button variant="outline-primary" type="submit">
                  <download-icon />
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
      <b-col v-if="loaded" cols="8" lg="6">
        <b-row>
          <b-button-group size="sm" class="text-center">
            <b-button
              :pressed="isPage('export-swab-report-area')"
              variant="outline-primary"
              @click="switchPage('export-swab-report-area')"
              >รายการจุดตรวจ Swab</b-button
            >
            <b-button
              :pressed="isPage('export-swab-report-product')"
              variant="outline-primary"
              @click="switchPage('export-swab-report-product')"
              >รายการตรวจสินค้า</b-button
            >
          </b-button-group>
        </b-row>
      </b-col>
    </b-row>

    <b-row v-show="loaded">
      <b-col>
        <NuxtPage
          :pagination="pagination"
          :data="displayData"
          :has-data="displayData.length > 0"
          :fromDate="dateRange.cachedFromDateString"
          :toDate="dateRange.cachedToDateString"
        />
      </b-col>
    </b-row>
  </div>
</template>
<style module></style>
