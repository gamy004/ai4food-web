<script setup lang="ts">
definePageMeta({
  title: "Ai4FoodSafety - Swab Product History Create Page",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: {
    name: "swab-product",
  },
});

const route = useRoute();

const id = route.params.update as string;
</script>

<template>
  <div class="page__swab-area-update mt-4">
    <h2 class="font-weight-bold">อัพเดตบันทึกการตรวจสินค้า</h2>

    <swab-product-history-form :id="id"></swab-product-history-form>
  </div>
</template>
