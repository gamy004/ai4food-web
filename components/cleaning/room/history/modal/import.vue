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
const { api: cleaningApi } = useCleaning();
const { getRoomByName } = useFacility();

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
  "cleaningRoomDate",
  "cleaningRoomStartedAt",
  "cleaningRoomEndedAt",
  "shift",
  "room",
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
    { key: "roomName", label: "ห้อง", thStyle: { width: "30%" } },
    {
      key: "cleaningRoomDate",
      label: "วันที่ล้างไลน์",
      thStyle: { width: "10%" },
    },
    {
      key: "cleaningRoomStartedAt",
      label: "เวลาเริ่ม",
      thStyle: { width: "5%" },
    },
    {
      key: "cleaningRoomEndedAt",
      label: "เวลาสิ้นสุด",
      thStyle: { width: "5%" },
    },
    { key: "shift", label: "กะ", thStyle: { width: "5%" } },

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
      var jsonResults = [];

      sheetNames.forEach((sheetName) => {
        //  test slicing for W1 sheet
        console.debug("sheetName: ", sheetName);
        const range = utils.decode_range(Sheets[sheetName]["!ref"]);
        let time = Sheets[sheetName].A2.w;
        // console.debug(time);
        time = time.trim().split(" ")[1];
        time = time.split("-");
        const month = time[1].split("/");
        // console.debug(month);
        const startTime = new Date(
          Number(month[2]),
          Number(month[1]) - 1,
          Number(time[0])
        );
        const endTime = new Date(
          Number(month[2]),
          Number(month[1]) - 1,
          Number(month[0])
        );
        // console.debug(startTime, endTime);

        // console.debug(range.s.r, range.e.c);
        const header = [
          "Room",
          "ล้างประจำวัน (ตามแผนผลิตปกติ)",
          "Std. เวลาล้าง ประจำวัน (ชั่วโมง)",
          "ล้างประจำสัปดาห์ (ตามแผนผลิตปกติ)",
          "Std. เวลาล้างประจำสัปดาห์(ชั่วโมง)",
        ];
        const timeHdr = [];
        const defaultHdr = [
          "เริ่ม",
          "เสร็จ",
          "รวมเวลาล้าง(ชั่วโมง)",
          "เวลา Diff จาก STD",
          "% ที่ล้างไลน์จริง",
        ];
        for (let d = startTime; d <= endTime; d.setDate(d.getDate() + 1)) {
          const date = d.toLocaleDateString("en-US");
          const newDay = defaultHdr.map((el) => date + "_day_" + el);
          const newNight = defaultHdr.map((el) => date + "_night_" + el);
          timeHdr.push(...newDay, ...newNight);
        }
        header.push(...timeHdr);
        /*
                        format table;
                        id:                     bigint
                        room_id:                bigint
                        cleaning_date:          DATE
                        cleaning_started_at     TIME
                        cleaning_end_at         TIME
                        import_transaction_id   bigint
                    */
        for (let R = 5; R <= range.e.c; ++R) {
          var history = utils.sheet_to_json(Sheets[sheetName], {
            header,
            raw: true,
            defval: null,
            range: utils.encode_range({
              s: { c: 2, r: R },
              e: { c: range.e.c, r: R },
            }),
          })[0];

          try {
            if (
              history[header[5]] !== undefined &&
              history[header[5]] !== null
            ) {
              // for each room
              // console.debug(history[header[5]], history.Room);
              const room = getRoomByName(history.Room);
              timeHdr.forEach((t) => {
                const ts = t.split("_");
                const date =
                  ts[0].split("/")[2] +
                  "-" +
                  (ts[0].split("/")[1].length > 1
                    ? ts[0].split("/")[1]
                    : "0" + ts[0].split("/")[1]) +
                  "-" +
                  (ts[0].split("/")[0].length > 1
                    ? ts[0].split("/")[0]
                    : "0" + ts[0].split("/")[0]);
                if (["เริ่ม"].includes(ts[2]) && room) {
                  console.debug("roomName: ", room.roomName);
                  jsonResults.push({
                    room: { id: room.id },
                    roomName: room.roomName,
                    cleaningRoomDate: date,
                    cleaningRoomStartedAt:
                      history[t].toFixed(2).split(".")[0] === "24"
                        ? "00:00:00"
                        : history[t].toFixed(2).split(".")[0] +
                          ":" +
                          history[t].toFixed(2).split(".")[1] +
                          ":00",
                    cleaningRoomEndedAt:
                      history[ts[0] + "_" + ts[1] + "_เสร็จ"]
                        .toFixed(2)
                        .split(".")[0] === "24"
                        ? "23:59:59"
                        : history[ts[0] + "_" + ts[1] + "_เสร็จ"]
                            .toFixed(2)
                            .split(".")[0] +
                          ":" +
                          history[ts[0] + "_" + ts[1] + "_เสร็จ"]
                            .toFixed(2)
                            .split(".")[1] +
                          ":00",
                    shift: ts[1],
                  });
                }
              });
            }
          } catch (e) {
            console.debug("e: ", e);
          }
        }
      });

      console.debug("jsonResults: ", jsonResults);

      hasImportedData.value = true;

      importedData.value = jsonResults;
    } catch (error) {
      console.debug("error: ", error);
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
        importType: "cleaning_room_history",
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

        await cleaningApi().importCleaningRoomHistory({
          importTransaction: {
            id: importTransaction.id,
          },
          records: redux(data),
        });
      }

      importApi().completeTransaction(importTransaction.id);

      setTimeout(() => {
        toast.success("นำเข้าข้อมูลเวลาการล้างไลน์สำเร็จ", { timeout: 1000 });

        console.log(
          importedDate.value[0].value.replaceAll("/", "-"),
          importedDate.value[importedDate.value.length - 1].value.replaceAll(
            "/",
            "-"
          )
        );

        const splittedFromDate: string = importedDate.value[0].value.split("/");
        const splittedToDate: string =
          importedDate.value[importedDate.value.length - 1].value.split("/");

        const fromDate: string = `${splittedFromDate[2]}-${splittedFromDate[1]}-${splittedFromDate[0]}`;
        const toDate: string = `${splittedToDate[2]}-${splittedToDate[1]}-${splittedToDate[0]}`;
        console.log(fromDate, toDate);

        emit("success", { fromDate, toDate });
      }, 1000);
    }
  } catch (error) {
    if (importTransaction) {
      importApi().cancelTransaction(importTransaction.id);
    }

    toast.error("นำเข้าข้อมูลเวลาการล้างไลน์ไม่สำเร็จ", { timeout: 1000 });

    console.debug("error", error);

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
      <template #title> นำเข้าข้อมูลเวลาการล้างไลน์ </template>

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
