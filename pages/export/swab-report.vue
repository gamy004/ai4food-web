<script lang="ts" setup>
definePageMeta({
  title: "Ai4FoodSafety - Swab report",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const route = useRoute();
const { isPage, goTo } = useNavigation();
const { getCurrentQuery } = useQueryParams();

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
  <div class="page__swab-report mt-4">
    <h2 class="font-weight-bold text-center">รายการจุดตรวจ</h2>
    <b-row align-h="center">
      <b-col cols="8" lg="6">
        <b-row>
          <b-button-group size="sm" class="text-center">
            <b-button
              :pressed="isPage('export-swab-area')"
              variant="outline-primary"
              @click="switchPage('export-swab-area')"
              >รายการจุดตรวจ Swab</b-button
            >
            <b-button
              :pressed="isPage('export-swab-product')"
              variant="outline-primary"
              @click="switchPage('export-swab-product')"
              >รายการตรวจสินค้า</b-button
            >
          </b-button-group>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>
<style module></style>
