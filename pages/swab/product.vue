<script lang="ts" setup>
definePageMeta({
    title: "Ai4FoodSafety - Swab Product Page",
    middleware: [
        "auth"
    ],
    canGoBack: true,
    fallBackRedirect: "/"
});

const route = useRoute();
const { today, onlyDate, dateToShift, stringToShift } = useDate();

const currentDate = today();

const form = reactive({
    date: route.query.date as string || onlyDate(currentDate),
    shift: stringToShift(route.query.shift as string) || dateToShift(currentDate),
    facilityId: route.query.facilityId as string || null,
    facilityItemId: route.query.facilityItemId as string || null,
    swabPeriodId: route.query.swabPeriodId as string || null
});

const pageManageSwabProduct = computed(() => {
    const routeParam = {
        name: "swab-product-history-create",
        query: {
            redirect: route.fullPath
        }
    };

    return routeParam;
});

</script>

<template>
    <div class="page__swab-product mt-4">
        <b-row>
            <b-col cols="8" class="text-start">
                <h2 class="font-weight-bold">บันทึก swab สินค้า</h2>
            </b-col>
            <b-col cols="4" class="text-end">
                <nuxt-link v-slot="{ navigate }" :to="pageManageSwabProduct" custom>
                    <button-arrow-right variant="outline-primary" size="md" @click="navigate">
                        เพิ่มบันทึก swab สินค้า
                    </button-arrow-right>
                </nuxt-link>
            </b-col>
        </b-row>

        <div class="d-grid gap-2 mt-3">
            <swab-filter v-model="form"
                :hidden-state="{ swabPeriod: true, facility: true, facilityItem: true, mainSwabArea: true }" />

            <hr>

            <swab-product-history-table :date="form.date" :facility-id="form.facilityId"
                :facility-item-id="form.facilityItemId" :swab-period-id="form.swabPeriodId" :shift="form.shift" />
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