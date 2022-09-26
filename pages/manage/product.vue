<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import UploadIcon from "~icons/carbon/upload";
import Product from "~~/models/Product";

definePageMeta({
  title: "Ai4FoodSafety - Manage Product",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});

const toast = useToast();
const { getProductById, api: productApi } = useProduct();
// const { today, onlyDate, onlyTime } = useDate();

const isFetched = ref(false);
const loading = ref(false);
const productIds = ref([]);
const editedId = ref(null);
const removedId = ref(null);
const showModal = ref(false);
const hasResults = ref(false);
const perPage = ref(100);
const currentPage = ref(1);

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    hasResults.value = false;

    try {
      const productData: Product[] = await productApi().loadAllProduct();

      if (productData.length) {
        hasResults.value = true;

        productIds.value = productData.map(({ id }) => id);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

const tableFields = computed(() => {
  return [
    { key: "order", label: "ลำดับ" },
    { key: "productCode", label: "รหัสสินค้า" },
    { key: "alternateProductCode", label: "รหัสสินค้าลำรอง" },
    { key: "productName", label: "ชื่อสินค้า" },
    {
      key: "action",
      label: "",
      thClass: "text-center",
      tdClass: "text-center",
    },
  ];
});

const productData = computed(() => {
  return productIds.value.map((productId, index) => {
    const product = getProductById(productId);

    return {
      order: index + 1,
      ...product,
    };
  });
});

const filteredData = computed(() =>
  productData.value.filter((_, idx) => {
    return (
      idx >= (currentPage.value - 1) * perPage.value &&
      idx < currentPage.value * perPage.value
    );
  })
);

const onCreateSuccess = async () => {
  await fetch;
};

const promptRemove = (id) => {
  removedId.value = id;
};

onBeforeMount(fetch);
</script>

<template>
  <div class="page__swab-report">
    <b-container>
      <b-row>
        <b-col cols="7">
          <b-row>
            <h3 class="font-weight-bold">รายการสินค้า</h3>
          </b-row>
        </b-col>

        <b-col cols="2" />
        <b-col class="d-flex justify-content-center">
          <b-button
            class="me-1"
            variant="outline-primary"
            @click="showModal = !showModal"
          >
            เพิ่มรายการสินค้า
          </b-button>
          <b-button class="me-1" variant="outline-primary" type="submit">
            <upload-icon />
          </b-button>
        </b-col>
      </b-row>

      <b-row class="mt-5">
        <b-col v-if="loading" cols="12" class="text-center">
          <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
        </b-col>

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
              <b-button variant="link">
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
                class="ms-3 text-danger"
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
            :total-rows="productData.length"
            :per-page="perPage"
            aria-controls="result-table"
          />
        </b-col>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center"> ไม่พบรายการสินค้า </b-card-text>
        </b-card>
      </b-row>
    </b-container>

    <product-modal-create v-model="editedId" @success="onCreateSuccess">
    </product-modal-create>
  </div>
</template>
<style module></style>
