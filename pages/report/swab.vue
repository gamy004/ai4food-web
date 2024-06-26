<script lang="ts" setup>
import { Shift } from "~~/composables/useDate";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { SwabStatus } from "~~/composables/useSwab";

definePageMeta({
  title: "Ai4FoodSafety - Update Test Page",

  middleware: ["auth"],

  canGoBack: true,
});

const route = useRoute();
const { today, onlyDate, stringToShift } = useDate();
const { isPage, goTo } = useNavigation();
const { getCurrentQuery } = useQueryParams();
const { api: labApi } = useLab();
const currentDate = today();
const loading = ref(false);
const error = ref(false);
const form = reactive({
  // date: (route.query.date as string) || onlyDate(currentDate),
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
  swabStatus: (route.query.swabStatus as SwabStatus) || null,
});
const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 20,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});
const fetch = async () => {
  error.value = false;
  loading.value = true;

  try {
    await labApi().loadAllBacteriaWithSpecie();
  } catch (e) {
    console.log(e);

    error.value = true;
  } finally {
    loading.value = false;
  }
};

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

onBeforeMount(fetch);
</script>

<template>
  <div class="page__update-plan mt-4">
    <h2 class="font-weight-bold text-center">รายการผลตรวจ swab</h2>

    <b-row align-h="center">
      <b-col cols="8" lg="6">
        <b-row>
          <b-button-group size="sm" class="text-center">
            <b-button
              :pressed="isPage('report-swab-area')"
              variant="outline-primary"
              @click="switchPage('report-swab-area')"
              >รายการจุดตรวจ Swab</b-button
            >
            <b-button
              :pressed="isPage('report-swab-product')"
              variant="outline-primary"
              @click="switchPage('report-swab-product')"
              >รายการตรวจสินค้า</b-button
            >
          </b-button-group>
        </b-row>
      </b-col>
    </b-row>

    <b-row class="mt-4">
      <b-col v-if="error" class="text-center">
        <p>พบข้อผิดพลาดในการโหลดข้อมูล</p>

        <b-button variant="dark" @click="fetch"> โหลดข้อมูลใหม่ </b-button>
      </b-col>

      <b-col v-else>
        <b-row>
          <b-col v-if="loading" class="text-center">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
          </b-col>

          <b-col v-else>
            <swab-test-filter
              v-model="form"
              :hidden-state="{
                date: true,
                dateRange: false,
                mainSwabArea: isPage('report-swab-product'),
                product: isPage('report-swab-area'),
                swabStatus: false,
              }"
              :col-state="{
                dateRange: 'sm-6 md-4',
                shift: 'sm-6 md-3',
                swabPeriod: 'sm-12 md-5',
                facility: 'sm-12 md-6',
                facilityItem: 'sm-12 md-6',
                mainSwabArea: '12',
                product: '12',
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
            />

            <hr />

            <NuxtPage v-model="form" :pagination="pagination" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>
