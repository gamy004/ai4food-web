<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import UploadIcon from "~icons/carbon/upload";
import SwabArea from "~~/models/SwabArea";
import { format } from "date-fns-tz";

definePageMeta({
  title: "Ai4FoodSafety - Swab Area",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const toast = useToast();
const { api: swabApi } = useSwab();
const { today } = useDate();
const { api: facilityApi, getFacilityById } = useFacility();

const currentDate = format(today(), "dd/MM/yyyy HH:mm:ss");
const isFetched = ref(false);
const loading = ref(false);
const error = ref(false);
const hasResults = ref(false);
const results = ref([]);
const perPage = ref(100);
const currentPage = ref(1);
const show = ref(false)
const swabAreaId = ref(null)
const deletedSwabAreaId  = ref(null)

async function onFormSubmitted() {
  hasResults.value = false;
  error.value = false;
  loading.value = true;
}
const tableFields = computed(() => {
  return [
    { key: "order", label: "ลำดับ", thStyle: { width: "10%" } },
    { key: "facility", label: "เครื่องจักร", thStyle: { width: "10%" } },
    { key: "swabArea", label: "ชื่อจุดตรวจ swab", thStyle: { width: "40%" } },
    {
      key: "subSwabArea",
      label: "จำนวนจุดย่อย",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "10%" },
    },
    {
      key: "action",
      label: "แก้ไข/ลบ",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "20%" },
    },
  ];
});

const filteredData = computed(() =>
  results.value.filter((_, idx) => {
    return (
      idx >= (currentPage.value - 1) * perPage.value &&
      idx < currentPage.value * perPage.value
    );
  })
);
const promptEdit = (id) => {
    // do something
    show.value = true;
    swabAreaId.value = id;
    console.log("edit",id)
};

const promptRemove = (id) => {
  // do something
  deletedSwabAreaId.value = id
  console.log("remove", id)
};

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;
    hasResults.value = false;
    try {
      results.value = [];
      const swabAreaData: SwabArea[] = await swabApi().loadAllMainSwabArea();
      await facilityApi().loadAllFacility();
      console.log(swabAreaData[0])
      if (swabAreaData.length) {
        swabAreaData.forEach((el, idx) => { 
          const facility = getFacilityById(el.facilityId);

          results.value.push({
            "order": idx+1,
            "facility": facility.facilityName,
            "swabArea": el.swabAreaName,
            "subSwabArea": el.subSwabAreas.length,
            "id": el.id  
          });
        });
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
const createSwab = () => {
  show.value = true
}
const onSuccess = async () => {
  isFetched.value = false;
  await fetch();
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
              <h3 class="font-weight-bold">รายการจุดตรวจ swab/ ATK</h3>
            </b-row>
          </b-col>
          <b-col alignSelf="end">
            <b-button variant="outline-primary" @click="createSwab">
              เพิ่มรายการจุดตรวจ
            </b-button>
            <!-- <b-button variant="outline-primary" type="submit">
              <upload-icon />
            </b-button> -->
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <div v-if="loading" class="col text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </div>
    <!-- <div v-if="hasResults">
      <p>
        รายการจุดตรวจ swab | ข้อมูลล่าสุด {{currentDate}} น.
      </p>
      <b-table id="result-table" hover small caption-top responsive :items="filteredData" />

      <b-pagination v-model="currentPage" align="center" :total-rows="results.length" :per-page="perPage"
        aria-controls="result-table" />
    </div> -->
    <b-col v-if="hasResults">
      <b-table
        id="result-table"
        hover
        small
        caption-top
        responsive
        :fields="tableFields"
        :items="filteredData"
      >
        <template #cell(action)="{ item }">
          <b-button variant="link" @click="promptEdit(item.id)" class="p-0">
            <CarbonEdit
              style="
                 {
                  fontsize: '1em';
                }
              "
            />
          </b-button>
          <b-button
            variant="link"
            @click="promptRemove(item.id)"
            class="ms-3 p-0 text-danger"
          >
            <CarbonTrashCan
              style="
                 {
                  fontsize: '1em';
                }
              "
            />
          </b-button>
        </template>
      </b-table>
      <b-pagination
        v-model="currentPage"
        align="center"
        :total-rows="results.length"
        :per-page="perPage"
        aria-controls="result-table"
      />
    </b-col>

    <p v-else>
      ไม่พบข้อมูลรายการจุดตรวจ swab ในวันที่ {{currentDate}} น.
    </p>
    <!-- <manage-swab-area-modal-create v-model="show" @success="onSuccess"> -->
    <!-- </manage-swab-area-modal-create> -->
    <manage-swab-area-modal-create
      v-model:id-value="swabAreaId"
      v-model:show-value="show"
      @success="onSuccess"
    >
    </manage-swab-area-modal-create>

    <manage-swab-area-modal-delete v-model="deletedSwabAreaId" @success="onSuccess">
    </manage-swab-area-modal-delete>
  </div>
</template>
<style module></style>
