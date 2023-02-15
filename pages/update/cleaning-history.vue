<script lang="ts" setup>
definePageMeta({
  title: "Ai4FoodSafety - Swab Product Page",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const route = useRoute();
const { today, onlyDate, dateToShift, stringToShift } = useDate();

const currentDate = today();

const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 20,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});

const form = reactive({
  date: (route.query.date as string) || onlyDate(currentDate),
  shift: stringToShift(route.query.shift as string) || dateToShift(currentDate),
  swabPeriodId: (route.query.swabPeriodId as string) || null,
  mainSwabAreaId: (route.query.mainSwabAreaId as string) || null,
  swabTestCode: (route.query.swabTestCode as string) || null,
});
</script>

<template>
  <div class="page__swab-product mt-4">
    <h2 class="font-weight-bold text-center">บันทึกการทำความสะอาด</h2>

    <div class="d-grid gap-2 mt-3">
      <swab-test-filter
        v-model="form"
        :hidden-state="{
          facility: true,
          facilityItem: true,
          mainSwabArea: false,
        }"
        :col-state="{
          date: 'sm-6 md-4',
          shift: 'sm-6 md-4',
          swabPeriod: 'sm-12 md-4',
          mainSwabArea: 'sm-12 md-4',
          swabTestCode: '12',
        }"
        :pagination-state="pagination.$state"
        :clearable-state="{
          swabPeriod: true,
          mainSwabArea: true,
        }"
        show-shift-all
      />

      <hr />

      <list-group-cleaning-history
        :date="form.date"
        :swab-period-id="form.swabPeriodId"
        :shift="form.shift"
        :swab-area-id="form.mainSwabAreaId"
        :swab-test-code="form.swabTestCode"
        :pagination="pagination"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input {
  &__swab-area-date {
    margin-left: 0.1rem !important;
  }
}
</style>
