<script lang="ts" setup>
import { chunk } from "lodash";
import { format } from "date-fns-tz";
import { useToast } from "vue-toastification";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";
import { Ref } from "vue";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";

export interface Props {
  showValue?: boolean;
}

const toast = useToast();
const { readFile, workbook } = useXlsx();
const { getAuth } = useAuth();
const { api: importApi } = useImport();
const { getProductByCode, api: productApi } = useProduct();

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
});

const emit = defineEmits(["update:showValue", "success", "error"]);

const modalRef = ref();
const fileInputRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);
const loading = ref(false);
const hasImportedData = ref(false);
const importedDate = ref([]);
const selectedImportedDate = ref(null);
const importedData = ref(null);
const user = getAuth();

const keys_to_keep = [
  "productScheduleAmount",
  "productScheduleDate",
  "productScheduleStartedAt",
  "productScheduleEndedAt",
  "product",
  "shift",
];

const redux = (array) =>
  array.map((o) =>
    keys_to_keep.reduce((acc, curr) => {
      acc[curr] = o[curr];
      return acc;
    }, {})
  );

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const tableFields = computed(() => {
  return [
    { key: "date", label: "วัน/เวลา ผลิต", thStyle: { width: "20%" } },
    { key: "productCode", label: "รหัสสินค้า", thStyle: { width: "20%" } },
    {
      key: "alternateProductCode",
      label: "รหัสสินค้าสำรอง",
      thStyle: { width: "20%" },
    },
    { key: "productName", label: "ชื่อสินค้า", thStyle: { width: "20%" } },
    {
      key: "productScheduleAmount",
      label: "จำนวน",
      thClass: "text-end",
      tdClass: "text-end",
      thStyle: { width: "20%" },
    },

    // { key: "productScheduleStartedAt", label: "เวลาเริ่ม", thStyle: { width: "5%" } },
    // { key: "productScheduleEndedAt", label: "เวลาสิ้นสุด", thStyle: { width: "5%" } },
    // {
    //   key: "action",
    //   label: "แก้ไข/ลบ",
    //   thClass: "text-end",
    //   tdClass: "text-end",
    //   thStyle: { width: "20%" },
    // },
  ];
});

const filteredImportedData = computed(() => {
  let data = importedData.value;

  if (selectedImportedDate.value) {
    data = data.filter((record) => {
      return record.date === selectedImportedDate.value;
    });
  }

  return data;
});

const clearState = () => {
  error.value = null;
  selectedImportedDate.value = null;
  hasImportedData.value = false;
  importedDate.value = [];
  importedData.value = [];
};

const onCancel = () => {
  clearState();

  showValue.value = false;
};

const onWorkbookRead = async (workbook) => {
  if (workbook && workbook.value) {
    loading.value = true;
    hasImportedData.value = false;
    importedDate.value = [];
    selectedImportedDate.value = null;

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
        let dayResult: any[] = utils.sheet_to_json(Sheets[sheetName], {
          header,
          raw: true,
          defval: null,
          range: new_range,
        });

        dayResult = dayResult.map((dayRecord) => {
          dayRecord.shift = Shift.DAY;

          return dayRecord;
        });

        /* night cell */
        range.s.r = 6; // starting row from 18:00
        range.e.r = last_row; // ending at 07:00
        range.s.c = night_cell;
        range.e.c = night_cell + night_cell - 4;
        new_range = utils.encode_range(range);
        let nightResult: any[] = utils.sheet_to_json(Sheets[sheetName], {
          header,
          raw: true,
          defval: null,
          range: new_range,
        });

        nightResult = nightResult.map((dayRecord) => {
          dayRecord.shift = Shift.NIGHT;

          return dayRecord;
        });

        /* concat json */
        jsonResults[time] = [...dayResult, ...nightResult];

        if (!selectedImportedDate.value) {
          selectedImportedDate.value = time;
        }
      }

      const results = [];
      Object.keys(jsonResults).forEach((sheetName) => {
        const arr = jsonResults[sheetName];

        importedDate.value.push({
          value: sheetName,
          text: `${sheetName} (${arr.length} รายการ)`,
        });

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
                  shift: obj.shift,
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
      toast.error("ไม่สามารถดึงข้อมูลได้ กรุญาลองใหม่อีกครั้ง", {
        timeout: 1000,
      });
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    }
  }

  fileInputRef.value.value = null;
};

const onSubmit = async () => {
  submitting.value = true;

  let importTransaction;

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

        await productApi().importProductSchedule({
          importTransaction: {
            id: importTransaction.id,
          },
          records: redux(data),
        });
      }

      importApi().completeTransaction(importTransaction.id);

      setTimeout(() => {
        toast.success("นำเข้าข้อมูลแผลการผลิตสำเร็จ", { timeout: 1000 });

        emit("success");
      }, 1000);
    }
  } catch (error) {
    if (importTransaction) {
      importApi().cancelTransaction(importTransaction.id);
    }

    toast.error("นำเข้าข้อมูลแผลการผลิตไม่สำเร็จ", { timeout: 1000 });

    emit("error", error);
  } finally {
    setTimeout(() => {
      submitting.value = false;
      showValue.value = false;
    }, 1000);
  }
};

watch(() => workbook, onWorkbookRead, { deep: true });
</script>

<template>
  <b-form @submit="onSubmit">
    <modal
      ref="modalRef"
      id="productCreateModal"
      fullscreen
      v-model="showValue"
    >
      <template #title> นำเข้าข้อมูลแผนการผลิต </template>

      <template #header-close>
        <b-col v-if="importedDate.length" cols="5" sm="4" class="text-end">
          <small>
            ข้อมูลนำเข้าทั้งหมด
            {{ importedData.length }} รายการ
          </small>

          <div class="input-group align-items-baseline">
            <label
              id="fieldset-importedDate"
              class="form-label d-block min-w-75px text-center"
              for="importedDate"
              >วันที่</label
            >
            <b-form-select
              name="importedDate"
              v-model="selectedImportedDate"
              :options="importedDate"
            ></b-form-select>
          </div>
        </b-col>
      </template>

      <template #default>
        <b-row class="row-gap-2 h-100" align-h="center" align-v="center">
          <b-col v-if="!hasImportedData" cols="12" class="text-center">
            <div class="text-dark">กรุณาเลือกไฟล์เพื่อทำการนำเข้าข้อมูล</div>

            <LineMdLoadingTwotoneLoop
              v-if="loading"
              :style="{ fontSize: '2em' }"
            />

            <label v-else for="fileInput" class="btn btn-outline-primary mt-2">
              <upload-icon />

              <span>นำเข้าข้อมูล</span>
            </label>
          </b-col>

          <b-col v-else>
            <b-table
              id="result-table"
              hover
              small
              caption-top
              responsive
              :fields="tableFields"
              :items="filteredImportedData"
            >
              <template #cell(date)="{ item, index }">
                <div>
                  <p>{{ item.date }}</p>
                  <p id="time">({{ item.startTime }} - {{ item.endTime }})</p>
                </div>
              </template>
            </b-table>
          </b-col>

          <input
            ref="fileInputRef"
            id="fileInput"
            type="file"
            style="display: none"
            @change="readFile"
          />
        </b-row>
      </template>

      <template #footer>
        <b-button v-if="!submitting" variant="light" @click.prevent="onCancel">
          ยกเลิก
        </b-button>

        <b-button
          v-if="hasImportedData"
          type="submit"
          variant="primary"
          :disabled="submitting"
        >
          <LineMdLoadingTwotoneLoop
            v-if="submitting"
            :style="{ fontSize: '1em' }"
          />

          <span v-else>นำเข้า</span>
        </b-button>
      </template>
    </modal>
  </b-form>
</template>
