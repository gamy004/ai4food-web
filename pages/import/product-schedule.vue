<script lang="ts" setup>
import { chunk } from "lodash";
import { format } from "date-fns-tz";
import { useToast } from "vue-toastification";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";
import UploadIcon from "~icons/carbon/upload";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";
import Datepicker from "@vuepic/vue-datepicker";
import Product from "~~/models/Product";
import { LoadProductScheduleParams } from "~~/composables/useProduct";

definePageMeta({
  title: "Ai4FoodSafety - Manage Product",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const toast = useToast();
const { readFile, workbook } = useXlsx();
const { api: importApi } = useImport();
const {
  getProductById,
  getProductByCode,
  getProductScheduleByIds,
  api: productApi,
} = useProduct();
const { today, onlyDate, formatThLocale, formatTimeThLocale } = useDate();
const currentDate = today();
const form = reactive({
  date: {
    from: onlyDate(currentDate),
    to: onlyDate(currentDate),
  },
});
const isFetched = ref(false);
const loading = ref(false);
const showModal = ref(false);
const currentPage = ref(1);
const hasResult = ref(false);
const hasImportedData = ref(false);
const perPage = ref(100);
const productScheduleIds = ref([]);
const productData = ref(null);
const importedData = ref(null);
const { getAuth } = useAuth();
const user = getAuth();
const keys_to_keep = [
  "productScheduleAmount",
  "productScheduleDate",
  "productScheduleStartedAt",
  "productScheduleEndedAt",
  "product",
];

const redux = (array) =>
  array.map((o) =>
    keys_to_keep.reduce((acc, curr) => {
      acc[curr] = o[curr];
      return acc;
    }, {})
  );

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
  }
};

const extractWorkbook = async (workbook) => {
  if (workbook && workbook.value) {
    loading.value = true;
    hasImportedData.value = false;
    try {
      const { Sheets = {} } = workbook.value;
      const sheetNames = workbook.value.SheetNames;
      const last_row = 18; // last row of schedule xlsx file
      const jsonResults = {};
      const productMap = {};
      /* loop foreach sheetName */
      for (const x in sheetNames) {
        const sheetName = sheetNames[x];
        const range = utils.decode_range(Sheets[sheetName]["!ref"]);
        const time = format(new Date(Sheets[sheetName].A2.w), "dd/MM/yyyy");

        range.s.r = 3;
        range.e.r = 5;
        range.s.c = 1;
        let C;
        const R = range.s.r; /* start in the first row */
        let night_cell = 0;
        const header = ["hr."];
        for (C = range.s.c; C <= range.e.c; ++C) {
          const cell =
            Sheets[sheetName][
              utils.encode_cell({ c: C, r: R })
            ]; /* find the cell in the first row */
          const cell1 =
            Sheets[sheetName][utils.encode_cell({ c: C, r: R + 1 })];
          const cell2 =
            Sheets[sheetName][utils.encode_cell({ c: C, r: R + 2 })];
          let hdr = "UNKNOWN " + C; // <-- replace with your desired default
          if (cell && cell.t) {
            hdr = utils.format_cell(cell);
            productMap[hdr] = {
              alt: utils.format_cell(cell1),
              name: utils.format_cell(cell2),
            };
          } else {
            night_cell = C;
            break;
          }
          header.push(hdr);
        }
        night_cell = night_cell + 3; // add skip 1 total row and 2 total basket
        /* day cell */
        range.s.r = 6; // starting row from 07:00
        range.e.r = last_row - 2; // ending row without 18:00-20:00
        range.s.c = 0;
        range.e.c = night_cell - 4;
        let new_range = utils.encode_range(range);
        const dayResult = utils.sheet_to_json(Sheets[sheetName], {
          header,
          raw: true,
          defval: null,
          range: new_range,
        });

        /* night cell */
        range.s.r = 6; // starting row from 18:00
        range.e.r = last_row; // ending at 07:00
        range.s.c = night_cell;
        range.e.c = night_cell + night_cell - 4;
        new_range = utils.encode_range(range);
        const nightResult = utils.sheet_to_json(Sheets[sheetName], {
          header,
          raw: true,
          defval: null,
          range: new_range,
        });

        /* concat json */
        dayResult.push(...nightResult);
        jsonResults[time] = dayResult;
      }
      console.log(jsonResults);
      console.log(productMap);
      const results = [];
      Object.keys(jsonResults).forEach((sheetName) => {
        const arr = jsonResults[sheetName];
        arr.forEach((obj) => {
          Object.keys(obj).forEach((key) => {
            const product = getProductByCode(key);
            if (String(key) !== "hr." && product) {
              if (isNaN(obj[key])) {
                obj[key] = null;
              }
              if (obj[key]) {
                const time = obj["hr."].split("-");
                const startTime = time[0].split(" ")[0];
                const endTime = time[1].split(" ")[0];
                // dd/MM/yyyy
                const date =
                  sheetName.split("/")[2] +
                  "-" +
                  sheetName.split("/")[1] +
                  "-" +
                  sheetName.split("/")[0];
                const resultJson = {
                  productCode: key,
                  alternateProductCode: productMap[key].alt,
                  productName: productMap[key].name,
                  productScheduleAmount: parseInt(obj[key]),
                  date: sheetName,
                  productScheduleDate: date,
                  startTime: startTime,
                  endTime: endTime,
                  productScheduleStartedAt:
                    startTime.split(".")[0] === "24"
                      ? "00:00:00"
                      : startTime.split(".")[0] +
                        ":" +
                        startTime.split(".")[1] +
                        ":00",
                  productScheduleEndedAt:
                    endTime.split(".")[0] === "24"
                      ? "23:59:59"
                      : endTime.split(".")[0] +
                        ":" +
                        endTime.split(".")[1] +
                        ":00",
                  product: {
                    id: product.id,
                  },
                };
                results.push(resultJson);
              }
            }
          });
        });
      });

      hasImportedData.value = true;

      importedData.value = results;
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

const importWorkbook = async () => {
  let importTransaction;

  console.log(workbook.vlue);

  try {
    if (importedData.value && importedData.value.length) {
      importTransaction = await importApi().createTransaction({
        importType: "product_schedule",
        importSource: "web",
        importedFileUrl: "-",
        importedFileName: "-",
        importedUser: {
          id: user.getUserId(),
        },
      });

      const chunkedImportedData = chunk(importedData.value, 50);

      for (let index = 0; index < chunkedImportedData.length; index++) {
        const data = chunkedImportedData[index];

        await productApi().createProductSchedule({
          importTransaction: {
            id: importTransaction.id,
          },
          records: redux(data),
        });
      }

      importApi().completeTransaction(importTransaction.id);

      setTimeout(() => {
        toast.success("นำเข้าข้อมูลแผลการผลิตสำเร็จ", { timeout: 1000 });
      }, 1000);
    }
  } catch (error) {
    if (importTransaction) {
      importApi().cancelTransaction(importTransaction.id);
    }

    toast.error("นำเข้าข้อมูลแผลการผลิตไม่สำเร็จ", { timeout: 1000 });
  }
};

const promptEdit = (id) => {
  // do something
  console.log("edit");
};

const promptDelete = async (id) => {
  // do something
  console.log("delete");
};

watch(() => workbook, extractWorkbook, { deep: true });
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
            <label for="fileInput" class="btn btn-outline-primary">
              <upload-icon />

              <span>นำเข้าข้อมูล</span>
            </label>
            <input
              id="fileInput"
              type="file"
              style="display: none"
              @change="readFile"
            />
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
            <b-card-text class="text-center"> ไม่พบรายการสินค้า </b-card-text>
          </b-card>
        </b-row>
      </b-container>
    </div>
  </div>
</template>
<style scoped lang="scss">
#time {
  font-size: 0.8em;
}
</style>
