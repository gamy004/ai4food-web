
<script lang="ts" setup>
import { useToast } from "vue-toastification";
import UploadIcon from "~icons/carbon/upload";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";
import { LoadProductScheduleParams } from "~~/composables/useProduct";

definePageMeta({
  title: "Ai4FoodSafety - Cleaning Room History",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const toast = useToast();
const {
  getProductById,
  getProductScheduleByIds,
  api: productApi,
} = useProduct();
const {
  api: facilityApi,
} = useFacility();
const {
  api: cleaningApi
} = useCleaning();
const { today, onlyDate, formatThLocale, formatTimeThLocale } = useDate();
const currentDate = today();
const form = reactive({
  date: {
    from: onlyDate(currentDate),
    to: onlyDate(currentDate),
  },
});
const loading = ref(false);
const showImportModal = ref(false);
const currentPage = ref(1);
const hasResult = ref(false);
const perPage = ref(100);
const productScheduleIds = ref([]);

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
  const data = getProductScheduleByIds(productScheduleIds.value);

  return data.map((record) => {
    const product = getProductById(record.productId);

    return {
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

const filteredData = computed(() =>
  tableData.value.filter((_, idx) => {
    return (
      idx >= (currentPage.value - 1) * perPage.value &&
      idx < currentPage.value * perPage.value
    );
  })
);

const fetch = async (formValue) => {
  hasResult.value = true;

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
    await facilityApi().loadAllRoom();

    const productSchedules = await productApi().loadProductSchedule(params);

    if (productSchedules && productSchedules.length) {
      productScheduleIds.value = productSchedules.map(({ id }) => id);
    } else {
      hasResult.value = false;
    }
  } catch (error) {
    toast.error("ไม่สามรถโหลดข้อมูลเวลาการล้างไลน์ได้ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
  }
};

const onImportedSuccess = ({ fromDate, toDate }) => {
  console.log(fromDate, toDate);

  form.date = {
    from: fromDate,
    to: toDate,
  };
};

const promptEdit = (id) => {
  // do something
  console.log("edit");
};

const promptDelete = async (id) => {
  // do something
  console.log("delete");
};

watch(
  () => form,
  (formValue) => {
    fetch(formValue);
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div>
    <div class="page__product-schedule">
      <b-container>
        <b-row>
          <b-col cols="8">
            <b-row>
              <h3 class="font-weight-bold">เวลาการล้างไลน์</h3>
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

          <b-col v-if="hasResult">
            <!-- <div class="alert alert-info" role="alert">
              พบข้อมูลแผนการผลิตที่ตรงกับข้อมูลสินค้าในระบบทั้งหมด
              {{ importedData.length }} รายการ
            </div> -->

            <b-table
              id="result-table"
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

            <b-pagination
              v-model="currentPage"
              align="center"
              :total-rows="tableData.length"
              :per-page="perPage"
              aria-controls="result-table"
            />
          </b-col>

          <b-card v-else bg-variant="light">
            <b-card-text class="text-center"> ไม่พบรายการล้างไลน์ </b-card-text>
          </b-card>
        </b-row>

        <cleaning-room-history-modal-import
          v-model:show-value="showImportModal"
          @success="onImportedSuccess"
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
