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
  mainSwabAreaId: (route.query.mainSwabAreaId as string) || null,
  swabPeriodId: (route.query.swabPeriodId as string) || null,
});
</script>

<template>
  <div class="page__swab-area mt-4">
    <h2 class="font-weight-bold text-center">บันทึกการตรวจจุด swab</h2>

    <div class="d-grid gap-2 mt-3">
      <swab-filter
        v-model="form"
        :hidden-state="{ facilityItem: true, mainSwabArea: false }"
        disabled
      />

      <hr />

      <swab-area-history-list
        :facility-id="form.facilityId"
        :main-swab-area-id="form.mainSwabAreaId"
        :swab-period-id="form.swabPeriodId"
        :date="form.date"
        :shift="form.shift"
      />
    </div>
  </div>
</template>
