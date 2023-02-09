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
  facilityId: (route.query.facilityId as string) || null,
  facilityItemId: (route.query.facilityItemId as string) || null,
  swabPeriodId: (route.query.swabPeriodId as string) || null,
  productId: (route.query.productId as string) || null,
  swabTestCode: (route.query.swabTestCode as string) || null,
});

// const pageManageSwabProduct = computed(() => {
//   const routeParam = {
//     name: "swab-product-history-create",
//     query: {
//       redirect: route.fullPath,
//     },
//   };

//   return routeParam;
// });
</script>

<template>
  <div class="page__swab-product mt-4">
    <h2 class="font-weight-bold text-center">บันทึกการตรวจสินค้า</h2>

    <div class="d-grid gap-2 mt-3">
      <swab-test-filter
        v-model="form"
        :hidden-state="{
          product: false,
        }"
        :col-state="{
          date: 'sm-6 md-4',
          shift: 'sm-6 md-4',
          swabPeriod: 'sm-12 md-4',
          facility: 'sm-12 md-4',
          facilityItem: 'sm-12 md-4',
          product: 'sm-12 md-4',
          swabTestCode: '12',
        }"
        :pagination-state="pagination.$state"
        :clearable-state="{
          swabPeriod: true,
          facility: true,
          facilityItem: true,
          product: true,
        }"
        show-shift-all
      />

      <hr />

      <swab-product-history-table
        :date="form.date"
        :facility-id="form.facilityId"
        :facility-item-id="form.facilityItemId"
        :swab-period-id="form.swabPeriodId"
        :shift="form.shift"
        :product-id="form.productId"
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
