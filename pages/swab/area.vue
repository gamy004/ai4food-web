<script lang="ts" setup>
definePageMeta({
  title: "Ai4FoodSafety - Update Swab Area History Page",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const route = useRoute();

const { today, onlyDate, dateToShift, stringToShift } = useDate();

const currentDate = today();

const form = reactive({
  date: (route.query.date as string) || onlyDate(currentDate),
  shift: stringToShift(route.query.shift as string) || dateToShift(currentDate),
  facilityId: (route.query.facilityId as string) || null,
  facilityItemId: (route.query.facilityItemId as string) || null,
  swabPeriodId: (route.query.swabPeriodId as string) || null,
  mainSwabAreaId: (route.query.mainSwabAreaId as string) || null,
  swabTestCode: (route.query.swabTestCode as string) || null,
});

const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 20,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});
</script>

<template>
  <div class="page__swab-area mt-4">
    <h2 class="font-weight-bold text-center">บันทึกจุดตรวจ swab</h2>

    <div class="d-grid gap-2 mt-3">
      <swab-test-filter
        v-model="form"
        :hidden-state="{ mainSwabArea: false }"
        :clearable-state="{
          swabPeriod: true,
          facility: true,
          facilityItem: true,
          mainSwabArea: true,
        }"
        :col-state="{
          date: 'sm-6 md-4',
          shift: 'sm-6 md-4',
          swabPeriod: 'sm-12 md-4',
          facility: 'sm-12 md-4',
          facilityItem: 'sm-12 md-4',
          mainSwabArea: 'sm-12 md-4',
          swabTestCode: '12',
        }"
        :pagination-state="pagination.$state"
        show-shift-all
      />

      <hr />

      <swab-area-history-table
        :date="form.date"
        :facility-id="form.facilityId"
        :facility-item-id="form.facilityItemId"
        :main-swab-area-id="form.mainSwabAreaId"
        :swab-period-id="form.swabPeriodId"
        :swab-test-code="form.swabTestCode"
        :shift="form.shift"
        :pagination="pagination"
      />
    </div>
  </div>
</template>
