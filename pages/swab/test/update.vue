<script lang="ts" setup>
import { Shift } from "~~/composables/useDate";
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
const currentDate = today();
const form = reactive({
  date: (route.query.date as string) || onlyDate(currentDate),
  shift: stringToShift(route.query.shift as string) || Shift.ALL,
  swabPeriodId: (route.query.swabPeriodId as string) || null,
  facilityId: (route.query.facilityId as string) || null,
  facilityItemId: (route.query.facilityItemId as string) || null,
  mainSwabAreaId: (route.query.mainSwabAreaId as string) || null,
  productId: (route.query.productId as string) || null,
  swabTestCode: (route.query.swabTestCode as string) || null,
  swabStatus: (route.query.swabStatus as SwabStatus) || SwabStatus.ALL,
});
const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 20,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});

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
</script>

<template>
  <div class="page__update-plan mt-4">
    <h2 class="font-weight-bold text-center">บันทึกผลตรวจ Lab</h2>

    <b-row align-h="center">
      <b-col cols="8" lg="6">
        <b-row>
          <b-button-group size="sm" class="text-center">
            <b-button
              :pressed="isPage('swab-test-update-area')"
              variant="outline-primary"
              @click="switchPage('swab-test-update-area')"
              >รายการจุด swab</b-button
            >
            <b-button
              :pressed="isPage('swab-test-update-product')"
              variant="outline-primary"
              @click="switchPage('swab-test-update-product')"
              >รายการสินค้า</b-button
            >
          </b-button-group>
        </b-row>
      </b-col>
    </b-row>

    <b-row class="mt-4">
      <b-col>
        <swab-test-filter
          v-model="form"
          :hidden-state="{
            mainSwabArea: isPage('swab-test-update-product'),
            product: isPage('swab-test-update-area'),
            swabStatus: false,
          }"
          :col-state="{
            date: 'sm-6 md-4',
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
          :swab-status-options="[
            SwabStatus.PENDING,
            SwabStatus.NORMAL,
            SwabStatus.DETECTED,
          ]"
        />

        <hr />

        <NuxtPage v-model="form" :pagination="pagination" />
      </b-col>
    </b-row>
  </div>
</template>
