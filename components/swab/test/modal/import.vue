<script lang="ts" setup>
import { chunk, keyBy } from "lodash";
import { useToast } from "vue-toastification";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";
import { Ref } from "vue";
import UploadIcon from "~icons/carbon/upload";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";
import { UpsertFileData } from "~~/composables/useUpload";
import SwabTest from "~~/models/SwabTest";

export interface Props {
  showValue?: boolean;
}

const toast = useToast();
const { readFile, workbook } = useXlsx();
const { getAuth } = useAuth();
const { api: importApi } = useImport();
const { api: swabTestApi } = useSwabTest();
const { getBacterias, api: bacteriaApi } = useBacteria();
const { today } = useDate();
const { uploadFile } = useUpload();

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
const hasNotAvailableData = ref(false);
const renderData = ref([]);
const importedDate = ref([]);
const selectedImportedDate = ref(null);
const importedData = ref(null);
const user = getAuth();
const showConfirmModal = ref(false);
const fileInput: Ref<File> = ref(null);
const uploading = ref(false);

const keys_to_keep = [
  "id",
  "bacteria",
  "swabTestCode",
  "swabTestRecordedAt",
  "bacteriaRecordedAt",
  "recordedUser",
  "bacteriaRecordedUser",
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
    { key: "swabTestCode", label: "รหัสตัวอย่าง", thStyle: { width: "40%" } },
    {
      key: "result",
      label: "ผลการตรวจเชื้อ",
      thStyle: { width: "40%" },
    },

    { key: "status", label: "สถานะ", thStyle: { width: "20%" } },
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
  let data = renderData.value;

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
  hasNotAvailableData.value = false;
  renderData.value = [];
  importedDate.value = [];
  importedData.value = [];
  fileInput.value = null;
};

const onCancel = () => {
  clearState();

  showValue.value = false;
};

const findSwabTestCodeIndex = (sheetDatas = []) => {
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

    if (workbook.file) {
      fileInput.value = workbook.file;

      console.log(fileInput.value);
    }

    try {
      const { Sheets = {} } = workbook.value;
      const sheetNames = workbook.value.SheetNames;

      await bacteriaApi().loadAllBacteria();

      const bacteriaData = getBacterias();

      let results = [];
      let availableData = [];
      let notAvailableData = [];

      /* loop foreach sheetName */
      const sheetResult = [];

      const currentDate = today();

      for (const x in sheetNames) {
        const sheetName = sheetNames[x];
        const sheetDatas = utils.sheet_to_json(Sheets[sheetName]);

        let records = [];
        if (sheetDatas && sheetDatas.length) {
          const swabTestCodeStartIndex = findSwabTestCodeIndex(sheetDatas);

          if (swabTestCodeStartIndex === null) {
            return toast.error(
              "ไม่พบตำแหน่งของคอลัมน์ Sample ID กรุณาตรวจสอบไฟล์"
            );
          }

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

            let swabTestCode = data[swabTestCodeKey];
            let resultBacteria = data[bacteriaKey];

            if (!swabTestCode || !resultBacteria) {
              continue;
            }

            swabTestCode = swabTestCode.toUpperCase().trim().replace(/\s/g, "");
            resultBacteria = resultBacteria.toUpperCase().trim();

            if (
              !swabTestCode.length ||
              !resultBacteria.length ||
              (resultBacteria !== "POSITIVE" && resultBacteria !== "NEGATIVE")
            ) {
              continue;
            }

            let bacteria = [];

            // const rule = (x) => x === resultBacteria;

            if (resultBacteria === "POSITIVE") {
              bacteria = bacteriaData.map((b) => {
                return { id: b.id };
              });
            }

            records.push({
              bacteria,
              swabTestCode: swabTestCode ? swabTestCode.trim() : swabTestCode,
            });
          }
        }

        const swabTestCodes = records.map((r) => r.swabTestCode);

        const response = await swabTestApi().loadSwabTestByCodes(swabTestCodes);

        const swabTestKeyByCode: Record<string, SwabTest> = keyBy(
          response,
          "swabTestCode"
        );

        //merge swab test
        const availableSwabTest = [];
        const notAvailableSwabTest = [];

        for (let index = 0; index < records.length; index++) {
          const record = records[index];
          const { swabTestCode } = record;

          const loadedSwabTest = swabTestKeyByCode[swabTestCode];

          if (loadedSwabTest) {
            sheetResult.push({
              ...record,
              status: "available",
            });

            availableSwabTest.push({
              ...record,
              id: loadedSwabTest.id,
              swabTestCode: loadedSwabTest.swabTestCode,
              recordedUser: {
                id: user.getUserId(),
              },
              bacteriaRecordedUser: {
                id: user.getUserId(),
              },
              swabTestRecordedAt: currentDate,
              bacteriaRecordedAt: currentDate,
            });
          } else {
            sheetResult.push({
              ...record,
              status: "notAvailable",
            });

            notAvailableSwabTest.push({
              ...record,
            });
          }
        }

        results = [...results, ...sheetResult];
        availableData = [...availableData, ...availableSwabTest];
        notAvailableData = [...notAvailableData, ...notAvailableSwabTest];
      }

      hasImportedData.value = true;

      hasNotAvailableData.value =
        notAvailableData && notAvailableData.length ? true : false;

      importedData.value = availableData;

      renderData.value = results;
    } catch (e) {
      console.log(e);

      toast.error("พบข้อผิดพลาดในการอ่านข้อมูนำเข้า กรุญาลองใหม่อีกครั้ง", {
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

const upload = async (importTransaction, file): Promise<void> => {
  try {
    uploading.value = true;

    let uploadedFile: UpsertFileData = await uploadFile({
      file,
      uploadObject: file,
      prefix: "import/swab-test",
    });

    if (uploadedFile) {
      const fileEntity = await importApi().createFile({
        fileKey: uploadedFile.fileKey,
        fileName: uploadedFile.fileName,
        fileSource: uploadedFile.fileSource,
        fileContentType: uploadedFile.fileContentType,
        fileSize: uploadedFile.fileSize,
        user: {
          id: user.getUserId(),
        },
      });

      if (fileEntity) {
        await importApi().updateTransaction(importTransaction.id, {
          importedFileName: fileEntity.fileName,
          importedFileUrl: fileEntity.fileSource,
          importedFile: {
            id: fileEntity.id,
          },
        });
      }
    }
  } catch (e) {
    toast.error("ไม่สามารถอัพโหลดไฟล์นำเข้าข้อมูลได้");
  } finally {
    uploading.value = false;
  }
};

const importSwabTest = async () => {
  submitting.value = true;

  let importTransaction;

  try {
    if (importedData.value && importedData.value.length) {
      if (fileInput.value) {
        console.log(fileInput.value.name);

        const { importTransactions } = await importApi().loadTransactions({
          importedFileName: fileInput.value.name,
        });

        console.log(importTransactions);

        if (importTransactions && importTransactions.length) {
          importTransaction = importTransactions[0];
        }
      }

      if (!importTransaction) {
        importTransaction = await importApi().createTransaction({
          importType: "swab_test",
          importSource: "web",
          importedFileUrl: "-",
          importedFileName: "-",
          importedUser: {
            id: user.getUserId(),
          },
        });
      }

      if (fileInput.value) {
        upload(importTransaction, fileInput.value);
      }

      const chunkedImportedData = chunk(importedData.value, 50);

      for (let index = 0; index < chunkedImportedData.length; index++) {
        const data = chunkedImportedData[index];
        const records = redux(data);

        await swabTestApi().importSwabTest({
          importTransaction: {
            id: importTransaction.id,
          },
          records: redux(data),
        });
      }

      await importApi().completeTransaction(importTransaction.id);

      emit("success");

      setTimeout(() => {
        toast.success("นำเข้าข้อมูลผลการตรวจเชื้อสำเร็จ", { timeout: 1000 });

        showValue.value = false;

        clearState();
      }, 1000);
    }
  } catch (error) {
    console.log(error);

    if (importTransaction) {
      importApi().cancelTransaction(importTransaction.id);
    }

    toast.error("นำเข้าข้อมูลผลการตรวจเชื้อไม่สำเร็จ", { timeout: 1000 });

    emit("error", error);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

const onSubmit = () => {
  if (hasNotAvailableData.value) {
    showConfirmModal.value = true;
  } else {
    importSwabTest();
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
              <template #cell(status)="{ item, index }">
                <b-badge
                  v-if="item.status == 'available'"
                  variant="success"
                  pill
                >
                  พบข้อมูลในระบบ
                </b-badge>

                <b-badge
                  v-if="item.status == 'notAvailable'"
                  variant="danger"
                  pill
                >
                  ไม่พบข้อมูลในระบบ
                </b-badge>
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

  <swab-test-modal-confirm
    v-model:show-value="showConfirmModal"
    @confirm="importSwabTest"
  />
</template>
