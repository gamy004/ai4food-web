<script setup lang="ts">
definePageMeta({
    title: "Ai4FoodSafety - Swab Product History Create Page",
    middleware: [
        "auth"
    ],
    canGoBack: true,
    fallBackRedirect: {
        name: "swab-product"
    }
});
</script>

<template>
    <div class="page__swab-area-create mt-4">
        <h2 class="font-weight-bold">
            เพิ่มบันทึก swab สินค้า
        </h2>

        <swab-product-history-form></swab-product-history-form>
    </div>
</template>
