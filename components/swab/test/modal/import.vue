<script lang="ts" setup>
import { chunk } from "lodash";
import { format } from "date-fns-tz";
import { useToast } from "vue-toastification";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";
import { Ref } from "vue";
import UploadIcon from "~icons/carbon/upload";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";

export interface Props {
  showValue?: boolean;
}

const toast = useToast();
const { readFile, workbook } = useXlsx();
const { getAuth } = useAuth();
const { api: importApi } = useImport();
const { getSwabTestByCode, api: swabTestApi } = useSwabTest();
const { getBacterias } = useBacteria();

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
  "id",
  "bacteria",
  "swabTestCode",
  "swabTestRecordedAt",
  "bacteriaRecordedAt",
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
    { key: "swabTestCode", label: "รหัสตัวอย่าง", thStyle: { width: "50%" } },
    {
      key: "result",
      label: "ผลการตรวจเชื้อ",
      thStyle: { width: "50%" },
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

  data = data.map((record) => {
    return {
      ...record,
      result:
        record.bacteria && record.bacteria.length ? "Positive" : "Negative",
    };
  });

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

const findSwabTestCodeIndex = async (sheetDatas = []) => {
  let swabTestCodeIndex = null;
  const keyOfSwabTestCode = "Sample ID";
  for (let index = 0; index < sheetDatas.length; index++) {
    const sheetData = sheetDatas[index];
    for (const key in sheetData) {
      if (Object.prototype.hasOwnProperty.call(sheetData, key)) {
        const element = sheetData[key];
        if (keyOfSwabTestCode === element) {
          swabTestCodeIndex = index;
          break;
        }
      }
    }
  }
  return swabTestCodeIndex;
};

const findKey = (keys = [], data = {}) => {
  let result = [];
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    for (const key in data) {
      if (data[key] === element) result.push(key);
    }
  }
  return result;
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
      const bacteriaData = getBacterias();
      let results = [];

      /* loop foreach sheetName */
      const sheetResult = [];

      for (const x in sheetNames) {
        const sheetName = sheetNames[x];
        const sheetDatas = utils.sheet_to_json(Sheets[sheetName]);

        if (sheetDatas && sheetDatas.length) {
          const swabTestCodeStartIndex = await findSwabTestCodeIndex(
            sheetDatas
          );

          if (swabTestCodeStartIndex === null)
            throw Error(`Can't found index of swab-test code`);

          const [swabTestCodeKey, bacteriaKey] = findKey(
            ["Sample ID", "Result"],
            sheetDatas[swabTestCodeStartIndex]
          );

          for (
            let index = swabTestCodeStartIndex + 1;
            index < sheetDatas.length;
            index++
          ) {
            const data = sheetDatas[index];
            const positiveKey = ["positive", "POSITIVE", "Positive"];
            const swabTestCode = data[swabTestCodeKey];
            const resultBacteria = data[bacteriaKey];
            let bacteria = [];

            const rule = (x) => x === resultBacteria;
            if (positiveKey.some(rule)) {
              bacteria = bacteriaData.map((b) => {
                return { id: b.id };
              });
            }

            // if (swabTestCode !== undefined) {
            const swabTest = getSwabTestByCode(swabTestCode);

            if (!swabTest) console.log("Error code:", swabTestCode);

            sheetResult.push({
              ...swabTest,
              recordedUser: {
                id: user.getUserId(),
              },
              bacteriaRecordedUser: {
                id: user.getUserId(),
              },
              swabTestRecordedAt: new Date(),
              bacteriaRecordedAt: new Date(),
              bacteria,
              swabTestCode,
            });
          }
        }
        // }

        results = [...results, ...sheetResult];
      }

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
        importType: "swab_test",
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

        const records = redux(data);
        console.log(records);

        // await swabTestApi().importSwabTest({
        //   importTransaction: {
        //     id: importTransaction.id,
        //   },
        //   records: redux(data),
        // });
      }

      // importApi().completeTransaction(importTransaction.id);

      // setTimeout(() => {
      //   toast.success("นำเข้าข้อมูลแผลการผลิตสำเร็จ", { timeout: 1000 });

      //   showValue.value = false;

      //   const firstImportedDate = importedDate.value[0].value; // dd/MM/yyyy
      //   const lastImportedDate =
      //     importedDate.value[importedDate.value.length - 1].value; // dd/MM/yyyy
      //   const fromDate = firstImportedDate
      //     .split("/")
      //     .reduceRight((acc, val) => {
      //       return acc.length ? `${acc}-${val}` : val;
      //     }, "");
      //   const toDate = lastImportedDate.split("/").reduceRight((acc, val) => {
      //     return acc.length ? `${acc}-${val}` : val;
      //   }, "");

      //   clearState();

      //   emit("success", { fromDate, toDate });
      // }, 1000);
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
      <template #title> นำเข้าข้อมูลผลการตรวจเชื้อ</template>

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
