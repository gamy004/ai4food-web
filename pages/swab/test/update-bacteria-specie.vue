<script lang="ts" setup>
import { Shift } from "~~/composables/useDate";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

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
  date: (route.query.date as string) || onlyDate(currentDate),
  shift: stringToShift(route.query.shift as string) || Shift.ALL,
  swabPeriodId: (route.query.swabPeriodId as string) || null,
  facilityId: (route.query.facilityId as string) || null,
  facilityItemId: (route.query.facilityItemId as string) || null,
  mainSwabAreaId: (route.query.mainSwabAreaId as string) || null,
  productId: (route.query.productId as string) || null,
  swabTestCode: (route.query.swabTestCode as string) || null,
});

const fetch = async () => {
  error.value = false;
  loading.value = true;

  try {
    await labApi().loadAllBacteria();
  } catch (e) {
    console.log(e);

    error.value = true;
  } finally {
    loading.value = false;
  }
};

const switchPage = async (name: string) => {
  const query = getCurrentQuery();

  await goTo({ name, query });
};

onBeforeMount(fetch);
</script>

<template>
  <div class="page__update-plan mt-4">
    <h2 class="font-weight-bold text-center">บันทึกผล Bacteria Specie</h2>

    <b-row align-h="center">
      <b-col cols="8" lg="6">
        <b-row>
          <b-button-group size="sm">
            <b-button
              :pressed="isPage('swab-test-update-bacteria-specie-area')"
              variant="outline-primary"
              @click="switchPage('swab-test-update-bacteria-specie-area')"
              >รายการจุดตรวจ Swab</b-button
            >
            <b-button
              :pressed="isPage('swab-test-update-bacteria-specie-product')"
              variant="outline-primary"
              @click="switchPage('swab-test-update-bacteria-specie-product')"
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
                mainSwabArea: isPage(
                  'swab-test-update-bacteria-specie-product'
                ),
                product: isPage('swab-test-update-bacteria-specie-area'),
              }"
              :col-state="{
                date: 'sm-6 md-4',
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
            />

            <hr />

            <NuxtPage v-model="form" :per-page="20" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>
