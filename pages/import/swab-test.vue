<script lang="ts" setup>
// import { useToast } from "vue-toastification";
import UploadIcon from "~icons/carbon/upload";
import { ImportType } from "~/models/ImportTransaction";
// import CarbonEdit from "~icons/carbon/edit";
// import CarbonTrashCan from "~icons/carbon/trash-can";
// import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
// import { LoadProductScheduleParams } from "~~/composables/useProduct";
import { DateRangeInterface } from "~~/composables/useDate";

export type FormType = {
  dateRange: DateRangeInterface | null;
};

definePageMeta({
  title: "Ai4FoodSafety - Manage Swab Test",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const route = useRoute();
// const toast = useToast();
// const { api: importTransactionApi } = useImport();
// const { api: bacteriaApi } = useBacteria();
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const { today, onlyDate, updateDateRangeQueryParams } = useDate();
const currentDate = today();
const form = reactive<FormType>({
  dateRange:
    route.query.from && route.query.to
      ? {
          from: (route.query.from as string) || onlyDate(currentDate),
          to: (route.query.to as string) || onlyDate(currentDate),
        }
      : null,
});
const listGroupImportTransactionRef = ref(null);
// const loading = ref(false);
const showImportModal = ref(false);
// const showManageModal = ref(false);
// const showDeleteModal = ref(false);
const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || 5,
  currentPage: parseInt(route.query.currentPage as string) || 1,
});

const listGroupImportTransactionRefProps = computed(() => ({
  dateRange: form.dateRange,
  importType: ImportType.SWAB_TEST,
  pagination,
}));
// const hasResult = ref(false);

// const tableFields = computed(() => {
//   return [
//     { key: "swabTestCode", label: "รหัสตัวอย่าง", thStyle: { width: "50%" } },
//     {
//       key: "result",
//       label: "ผลการตรวจเชื้อ",
//       thStyle: { width: "50%" },
//     },

//     // { key: "productScheduleStartedAt", label: "เวลาเริ่ม", thStyle: { width: "5%" } },
//     // { key: "productScheduleEndedAt", label: "เวลาสิ้นสุด", thStyle: { width: "5%" } },
//     // {
//     //   key: "action",
//     //   label: "แก้ไข/ลบ",
//     //   thClass: "text-end",
//     //   tdClass: "text-end",
//     //   thStyle: { width: "20%" },
//     // },
//   ];
// });

// const tableData = computed(() => {
//   return swabTestIds.value.map((swabTestId) => {
//     const swabTest = getSwabTestById(swabTestId);
//     return {
//       ...swabTest,
//       result: swabTest.swabTestRecordedAt
//         ? swabTest.bacteria && swabTest.bacteria.length
//           ? "Positive"
//           : "Negative"
//         : "-",
//     };
//   });
// });

// const tableData = computed(() => {
//   return productScheduleIds.value
//     .map((productScheduleId) => getProductScheduleById(productScheduleId))
//     .filter(Boolean)
//     .map((record) => {
//       const product = getProductById(record.productId);

//       return {
//         id: record.id,
//         date: formatThLocale(record.productScheduleDate, "ddMMyy"),
//         productCode: product.productCode,
//         alternateProductCode: product.alternateProductCode,
//         productName: product.productName,
//         productScheduleAmount: record.productScheduleAmount,
//         startTime: formatTimeThLocale(record.productScheduleStartedAt),
//         endTime: formatTimeThLocale(
//           record.productScheduleEndedAt === "23:59:59"
//             ? "00:00:00"
//             : record.productScheduleEndedAt
//         ),
//       };
//     });
// });

// const filteredData = computed(() => pagination.paginate(tableData.value));

// const fetch = async (formValue) => {
//   loading.value = true;
//   hasResult.value = true;
//   swabTestIds.value = [];

//   try {
//     await bacteriaApi().loadAllBacteria();

//     const swabTests = await swabTestApi().loadSwabTest({
//       skip: pagination.offset.value,
//       take: pagination.$state.perPage,
//     });

//     if (swabTests && swabTests.length) {
//       swabTestIds.value = swabTests.map(({ id }) => id);
//     } else {
//       hasResult.value = false;
//     }
//   } catch (error) {
//     toast.error("ไม่สามรถโหลดข้อมูลแผนการผลิตได้ กรุณาลองใหม่อีกครั้ง", {
//       timeout: 1000,
//     });
//   } finally {
//     setTimeout(() => {
//       loading.value = false;
//     }, 1000);
//   }
// };

const onImportedSuccess = () => {
  console.log("on import success!!");

  form.dateRange = null;

  if (form.dateRange !== null) {
    form.dateRange = null;
  } else if (pagination.$state.currentPage !== 1) {
    const updatedQuery = getCurrentQuery();

    pagination.resetPage();

    updateQueryParams({
      ...updatedQuery,
      currentPage: 1,
    });
  } else {
    listGroupImportTransactionRef.value?.fetch(
      listGroupImportTransactionRefProps.value
    );
  }
};

// const onManagedSuccess = async () => {
//   await fetch(form);
// };

// const promptEdit = (id) => {
//   showManageModal.value = true;
//   productScheduleId.value = id;
// };

// const promptDelete = (id) => {
//   showDeleteModal.value = true;
//   deletedProductScheduleId.value = id;
// };

// watch(
//   () => form,
//   (formValue) => {
//     fetch(formValue);
//   },
//   { immediate: true, deep: true }
// );

watch(
  () => form.dateRange,
  (value) => {
    pagination.resetPage();

    updateDateRangeQueryParams(value, { currentPage: 1 });
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
              <h3 class="font-weight-bold">รายงานผลการตรวจเชื้อ</h3>
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

              <date-picker-range
                v-model="form.dateRange"
                class="col"
                clearable
              />
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-3">
          <!-- <b-col v-if="loading" cols="12" class="text-center">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
          </b-col> -->

          <b-col>
            <list-group-import-transaction
              ref="listGroupImportTransactionRef"
              v-bind="listGroupImportTransactionRefProps"
            ></list-group-import-transaction>
          </b-col>
        </b-row>

        <swab-test-modal-import
          v-model:show-value="showImportModal"
          @success="onImportedSuccess"
        />

        <!-- <product-schedule-modal-manage
          v-model:id-value="productScheduleId"
          v-model:show-value="showManageModal"
          @success="onManagedSuccess"
        />

        <product-schedule-modal-delete
          v-model:id-value="deletedProductScheduleId"
          v-model:show-value="showDeleteModal"
        /> -->
      </b-container>
    </div>
  </div>
</template>
<style scoped lang="scss">
#time {
  font-size: 0.8em;
}
</style>
