<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import DownloadIcon from "~icons/carbon/download";
import SwabArea from "~~/models/SwabArea";

definePageMeta({
  title: "Ai4FoodSafety - Swab Area",
  middleware: [
    "auth"
  ],
  canGoBack: true,
  fallBackRedirect: "/"
});
const toast = useToast();
const { api: swabApi } = useSwab();
const { api: facilityApi, getFacilityById } = useFacility();

const isFetched = ref(false);
const loading = ref(false);
const error = ref(false);
const hasResults = ref(false);
const results = ref([]);
const perPage = ref(100);
const currentPage = ref(1);


async function onFormSubmitted() {
  hasResults.value = false;
  error.value = false;
  loading.value = true;
}

const filteredData = computed(
  () => results.value.filter((_, idx) => {
    return (idx >= (currentPage.value - 1) * perPage.value) && (idx < currentPage.value * perPage.value);
  })
);
const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;
    hasResults.value = false;
    try {
      results.value = [];
      const swabAreaData: SwabArea[] = await swabApi().loadAllMainSwabArea();
      await facilityApi().loadAllFacility();
      if (swabAreaData.length) {
        swabAreaData.forEach((el,_) => {
          const facility = getFacilityById(el.facilityId);
          results.value.push({
            "Facility": facility.facilityName,
            "swab Area": el.swabAreaName,
            "จุด Swab หลัก": el.mainSwabAreaId,
            "จุด Swab รอง": "",
            "รายละเอียด": ""
          });
        })

      }
      hasResults.value = results.value.length > 0;
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลจุดตรวจตรวจได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

onBeforeMount(async () => {
  isFetched.value = false;

  await fetch();
});

</script>
    
<template>
  <div class="page__swab-report">
    <b-form class="w-100" @submit="onFormSubmitted">
      <b-container>
        <b-row>
          <b-col cols="9">
            <b-row>
              <h3 class="font-weight-bold">
                รายการจุดตรวจ swab/ ATK
              </h3>
            </b-row>
          </b-col>
          <b-col >
            <b-button variant="outline-primary">
              เพิ่มรายการจุดตรวจ
            </b-button>
          </b-col>
          <b-col cols="1" alignSelf="end">
            <b-button variant="outline-primary" type="submit">
              <download-icon />
            </b-button>
          </b-col>
        </b-row>
        <b-row>
          <div v-if="loading" class="col text-center mt-5">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
          </div>
          <div v-if="hasResults">
            <b-table id="result-table" hover small caption-top responsive :items="filteredData" />

            <b-pagination v-model="currentPage" align="center" :total-rows="results.length" :per-page="perPage"
              aria-controls="result-table" />
          </div>

          <p v-else>
            ไม่พบข้อมูลรายการจุดตรวจ swab
          </p>
        </b-row>
      </b-container>
    </b-form>

  </div>
</template>
<style module>

</style>
    