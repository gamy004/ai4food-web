<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import UploadIcon from "~icons/carbon/upload";
import Product from "~~/models/Product";

definePageMeta({
  title: "Ai4FoodSafety - Manage Product",
  middleware: [
    "auth"
  ],
  canGoBack: true,
  fallBackRedirect: "/"
});
const toast = useToast();
const { api: productApi, getProductByIds } = useProduct();
const {
  today,
  onlyDate,
  onlyTime
} = useDate();

const isFetched = ref(false);
const loading = ref(false);
const productIds = ref([]);
const showModal = ref(false);
const hasResults = ref(false);
const results = ref([]);
const perPage = ref(100);
const currentPage = ref(1);

function reportMixin_setWidthColumn(ws, header, data, fixedLengthHeader = {}) {
  const objectMaxLength = header.map(h => fixedLengthHeader[h] || h.length);

  for (let i = 0; i < data.length; i++) {
    header.forEach((key, j) => {
      if (!fixedLengthHeader[key]) {
        const valueString = data[i][key];
        objectMaxLength[j] =
          objectMaxLength[j] >= valueString.length
            ? objectMaxLength[j]
            : valueString.length;
      }
    });
  }

  ws["!cols"] = objectMaxLength.map(obj => ({ width: obj }));

  return ws;
}

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;
    hasResults.value = false;

    try {
      const ProductData: Product[] = await productApi().loadAllProduct();

      results.value = [];

      if (ProductData.length) {
        hasResults.value = true;
        productIds.value = ProductData.map(({ id }) => id);
        console.debug(ProductData)
        ProductData.forEach((el, idx) => {
          results.value.push({
            ลำดับ: idx + 1,
            ชื่อสินค้า: el.productName,
            รหัสสินค้า: el.productCode,
            รหัสสินค้าสำรอง: el.alternateProductCode
          });
        });
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

const filteredData = computed(
  () => results.value.filter((_, idx) => {
    return (idx >= (currentPage.value - 1) * perPage.value) && (idx < currentPage.value * perPage.value);
  })
);

const onCreateSuccess = async () => {
  await fetch;
};

onBeforeMount(fetch);

</script>

<template>
  <div class="page__swab-report">
    <b-container>
      <b-row>
        <b-col cols="7">
          <b-row>
            <h3 class="font-weight-bold">
              รายการสินค้า
            </h3>
          </b-row>
        </b-col>
        <b-col cols="2" />
        <b-col class="d-flex justify-content-center">
          <b-button class="me-1" variant="outline-primary" @click="showModal = !showModal">
            เพิ่มรายการสินค้า
          </b-button>
          <b-button class="me-1" variant="outline-primary" type="submit">
            <upload-icon />
          </b-button>
        </b-col>
      </b-row>
    </b-container>
    <product-modal-create v-model="showModal" @success="onCreateSuccess">
    </product-modal-create>
    <div v-if="loading" class="col text-center mt-5">
      <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
    </div>
    <p>
      รายการสินค้า | ข้อมูลล่าสุด {{ onlyDate(today()) + ' ' + onlyTime(today()) + ' น.' }}
    </p>
    <div v-if="hasResults">
      <b-table id="result-table" hover small caption-top responsive :items="filteredData" />

      <b-pagination v-model="currentPage" align="center" :total-rows="results.length" :per-page="perPage"
        aria-controls="result-table" />
    </div>

    <b-card v-else bg-variant="light">
      <b-card-text class="text-center">
        ไม่พบรายการสินค้า
      </b-card-text>
    </b-card>
  </div>
</template>
<style module>

</style>
