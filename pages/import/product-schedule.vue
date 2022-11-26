<script lang="ts" setup>
import { useToast } from "vue-toastification";
import UploadIcon from "~icons/carbon/upload";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { LoadProductScheduleParams } from "~~/composables/useProduct";

definePageMeta({
  title: "Ai4FoodSafety - Manage Product",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const route = useRoute();
const toast = useToast();
const {
  getProductById,
  getProductScheduleById,
  api: productApi,
} = useProduct();
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const { today, onlyDate, formatThLocale, formatTimeThLocale } = useDate();
const currentDate = today();
const form = reactive({
  date: {
    from: (route.query.from as string) || onlyDate(currentDate),
    to: (route.query.to as string) || onlyDate(currentDate),
  },
});
const loading = ref(false);
const showImportModal = ref(false);
const showManageModal = ref(false);
const showDeleteModal = ref(false);
const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 25,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});
const hasResult = ref(false);
const productScheduleIds = ref([]);
const productScheduleId = ref(null);
const deletedProductScheduleId = ref(null);

const tableFields = computed(() => {
  return [
    { key: "date", label: "วัน/เวลา ผลิต", thStyle: { width: "20%" } },
    { key: "productCode", label: "รหัสสินค้า", thStyle: { width: "20%" } },
    {
      key: "alternateProductCode",
      label: "รหัสสินค้าสำรอง",
      thStyle: { width: "20%" },
    },
    { key: "productName", label: "ชื่อสินค้า", thStyle: { width: "10%" } },
    {
      key: "productScheduleAmount",
      label: "จำนวน",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "10%" },
    },

    // { key: "productScheduleStartedAt", label: "เวลาเริ่ม", thStyle: { width: "5%" } },
    // { key: "productScheduleEndedAt", label: "เวลาสิ้นสุด", thStyle: { width: "5%" } },
    {
      key: "action",
      label: "แก้ไข/ลบ",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "20%" },
    },
  ];
});

const tableData = computed(() => {
  return productScheduleIds.value
    .map((productScheduleId) => getProductScheduleById(productScheduleId))
    .filter(Boolean)
    .map((record) => {
      const product = getProductById(record.productId);

      return {
        id: record.id,
        date: formatThLocale(record.productScheduleDate, "ddMMyy"),
        productCode: product.productCode,
        alternateProductCode: product.alternateProductCode,
        productName: product.productName,
        productScheduleAmount: record.productScheduleAmount,
        startTime: formatTimeThLocale(record.productScheduleStartedAt),
        endTime: formatTimeThLocale(
          record.productScheduleEndedAt === "23:59:59"
            ? "00:00:00"
            : record.productScheduleEndedAt
        ),
      };
    });
});

const filteredData = computed(() => pagination.paginate(tableData.value));

const fetch = async (formValue) => {
  loading.value = true;
  hasResult.value = true;
  productScheduleIds.value = [];

  const params: LoadProductScheduleParams = {
    fromDate: null,
    toDate: null,
  };

  if (formValue.date.from) {
    params.fromDate = formValue.date.from;
  }

  if (formValue.date.from) {
    params.toDate = formValue.date.to;
  }

  try {
    await productApi().loadAllProduct();

    const productSchedules = await productApi().loadProductSchedule(params);

    if (productSchedules && productSchedules.length) {
      productScheduleIds.value = productSchedules.map(({ id }) => id);
    } else {
      hasResult.value = false;
    }
  } catch (error) {
    toast.error("ไม่สามรถโหลดข้อมูลแผนการผลิตได้ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  }
};

const onImportedSuccess = ({ fromDate, toDate }) => {
  form.date = {
    from: fromDate,
    to: toDate,
  };
};

const onManagedSuccess = async () => {
  await fetch(form);
};

const promptEdit = (id) => {
  showManageModal.value = true;
  productScheduleId.value = id;
};

const promptDelete = (id) => {
  showDeleteModal.value = true;
  deletedProductScheduleId.value = id;
};

watch(
  () => form,
  (formValue) => {
    fetch(formValue);
  },
  { immediate: true, deep: true }
);

watch(
  () => form.date,
  (formDateValue) => {
    const fromDate = formDateValue.from ? onlyDate(formDateValue.from) : null;

    const toDate = formDateValue.to ? onlyDate(formDateValue.to) : null;

    const updatedQuery = { ...getCurrentQuery() };

    if (fromDate) {
      updatedQuery.from = fromDate;
      updatedQuery.to = !toDate ? fromDate : toDate;
    }

    updateQueryParams({
      ...updatedQuery,
    });
  },
  { deep: true }
);
</script>

<template>
  <div>
    <div class="page__product-schedule">
      <b-container>
        <b-row>
          <b-col cols="8">
            <b-row>
              <h3 class="font-weight-bold">แผนการผลิตสินค้า</h3>
            </b-row>
          </b-col>

          <b-col class="d-flex justify-content-end">
            <!-- <b-button
              class="me-1"
              variant="outline-primary"
              @click="showModal = true"
            >
              เพิ่มรายการสินค้า
            </b-button> -->
            <b-button variant="outline-primary" @click="showImportModal = true">
              <upload-icon />

              <span>นำเข้าข้อมูล</span>
            </b-button>
          </b-col>
        </b-row>

        <b-row class="row-gap-2 mt-3">
          <b-col cols="12" sm="8" md="4">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-75px"
                >วันที่</label
              >

              <date-picker-range v-model="form.date" class="col" />
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-3">
          <b-col v-if="loading" cols="12" class="text-center">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
          </b-col>

          <b-col v-else>
            <div v-if="hasResult">
              <!-- <div class="alert alert-info" role="alert">
              พบข้อมูลแผนการผลิตที่ตรงกับข้อมูลสินค้าในระบบทั้งหมด
              {{ importedData.length }} รายการ
            </div> -->

              <b-table
                id="productScheduleTable"
                hover
                small
                caption-top
                responsive
                :fields="tableFields"
                :items="filteredData"
              >
                <template #cell(date)="{ item, index }">
                  <div>
                    <p>{{ item.date }}</p>
                    <p id="time">({{ item.startTime }} - {{ item.endTime }})</p>
                  </div>
                </template>
                <template #cell(action)="{ item, index }">
                  <b-button
                    variant="link"
                    @click="promptEdit(item.id)"
                    class="p-0"
                  >
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
                    @click="promptDelete(item.id)"
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

              <base-pagination
                v-model="pagination.$state.currentPage"
                :per-page="pagination.$state.perPage"
                :total-rows="tableData.length"
                aria-controls="productScheduleTable"
              />
            </div>

            <b-card v-else bg-variant="light">
              <b-card-text class="text-center"> ไม่พบรายการสินค้า </b-card-text>
            </b-card>
          </b-col>
        </b-row>

        <product-schedule-modal-import
          v-model:show-value="showImportModal"
          @success="onImportedSuccess"
        />

        <product-schedule-modal-manage
          v-model:id-value="productScheduleId"
          v-model:show-value="showManageModal"
          @success="onManagedSuccess"
        />

        <product-schedule-modal-delete
          v-model:id-value="deletedProductScheduleId"
          v-model:show-value="showDeleteModal"
        />
      </b-container>
    </div>
  </div>
</template>
<style scoped lang="scss">
#time {
  font-size: 0.8em;
}
</style>
