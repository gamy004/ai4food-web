<script lang="ts" setup>
import { defineComponent, Ref } from "vue";
import { format } from "date-fns-tz";
import { useToast } from "vue-toastification";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";
import UploadIcon from "~icons/carbon/upload";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";


definePageMeta({
  title: "Ai4FoodSafety - Manage Product",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: "/",
});
const toast = useToast();
const { readFile, workbook } = useXlsx();
const isFetched = ref(false);
const loading = ref(false);
const showModal = ref(false);
const currentPage = ref(1);
const hasResults = ref(false);
const perPage = ref(100);
const productData = ref(null)
const tableFields = computed(() => {
  return [
    { key: "productScheduleDate", label: "วัน/เวลา ผลิต", thStyle: { width: "20%" } },
    { key: "productCode", label: "รหัสสินค้า", thStyle: { width: "20%" } },
    {
      key: "alternateProductCode",
      label: "รหัสสินค้าสำรอง",
      thStyle: { width: "20%" },
    },
    { key: "productName", label: "ชื่อสินค้า", thStyle: { width: "10%" } },
    { key: "productScheduleAmount", label: "จำนวน", thStyle: { width: "10%" } },

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

const fetch = async () => {
  if (workbook && workbook.value) {
    loading.value = true;
    hasResults.value = false;
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
        let C; const R = range.s.r; /* start in the first row */
        let night_cell = 0;
        const header = ["hr."];
        for (C = range.s.c; C <= range.e.c; ++C) {
          const cell = Sheets[sheetName][utils.encode_cell({ c: C, r: R })]; /* find the cell in the first row */
          const cell1 = Sheets[sheetName][utils.encode_cell({ c: C, r: R + 1 })];
          const cell2 = Sheets[sheetName][utils.encode_cell({ c: C, r: R + 2 })];
          let hdr = "UNKNOWN " + C; // <-- replace with your desired default
          if (cell && cell.t) {
            hdr = utils.format_cell(cell);
            productMap[hdr] = {
              "alt": utils.format_cell(cell1),
              "name": utils.format_cell(cell2)
            }
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
        const dayResult = utils.sheet_to_json(Sheets[sheetName], { header, raw: true, defval: null, range: new_range });

        /* night cell */
        range.s.r = 6; // starting row from 18:00
        range.e.r = last_row; // ending at 07:00
        range.s.c = night_cell;
        range.e.c = night_cell + night_cell - 4;
        new_range = utils.encode_range(range);
        const nightResult = utils.sheet_to_json(Sheets[sheetName], { header, raw: true, defval: null, range: new_range });

        /* concat json */
        dayResult.push(...nightResult);
        jsonResults[time] = dayResult;
      }
      console.log(jsonResults)
      console.log(productMap)
      const results = [];
      Object.keys(jsonResults).forEach((sheetName) => {
        const arr = jsonResults[sheetName];
        arr.forEach((obj) => {
          Object.keys(obj).forEach((key) => {
            if (String(key) !== "hr.") {
              if (isNaN(obj[key])) { obj[key] = null; }
              const time = obj["hr."].split("-");
              const startTime = time[0].split(" ")[0];
              const endTime = time[1].split(" ")[0];
              const resultJson = {
                productCode: key,
                alternateProductCode: productMap[key].alt,
                productName: productMap[key].name,
                productScheduleAmount: obj[key] ? Number(obj[key]).toFixed(2) : "-",
                productScheduleDate: sheetName,
                productScheduleStartedAt: startTime,
                productScheduleEndedAt: endTime
              };
              results.push(resultJson);
            }
          });
        });
      });
      hasResults.value = true;
      productData.value = results;
      console.log(results)
    }
    catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

const filteredData = computed(() =>
  productData.value.filter((_, idx) => {
    return (
      idx >= (currentPage.value - 1) * perPage.value &&
      idx < currentPage.value * perPage.value
    );
  })
);

const promptEdit = (id) => {
  // do something
  console.log("edit")
};

const promptDelete = async (id) => {
  // do something
  console.log("delete")
};
watch(() => workbook, fetch, { immediate: true, deep: true });
onBeforeMount(fetch);

</script>

<template>
  <div>
    <div class="page__product-schedule">
      <b-container>
        <b-row>
          <b-col cols="7">
            <b-row>
              <h3 class="font-weight-bold">รายการสินค้า</h3>
            </b-row>
          </b-col>

          <b-col cols="2" />
          <b-col class="d-flex justify-content-center">
            <b-button class="me-1" variant="outline-primary" @click="showModal = true">
              เพิ่มรายการสินค้า
            </b-button>
            <label for="fileInput" class="btn btn-outline-primary">
              <upload-icon />
            </label>
            <input id="fileInput" type="file" style="display: none;" @change="readFile" />
          </b-col>
        </b-row>

        <b-row class="mt-5">
          <b-col v-if="loading" cols="12" class="text-center">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
          </b-col>

          <b-col v-if="hasResults">
            <b-table id="result-table" hover small caption-top responsive :fields="tableFields" :items="filteredData">
              <template #cell(productScheduleDate)=" {item, index} ">
                <div>
                  <p>{{item.productScheduleDate}}</p>
                  <p style="{fontsize: '0.1em';}">({{item.productScheduleStartedAt}} - {{item.productScheduleEndedAt}})</p>
                </div>
              </template>
              <template #cell(action)="{ item, index }">
                <b-button variant="link" @click="promptEdit(item.id)" class="p-0">
                  <CarbonEdit style="
                     {
                      fontsize: '1em';
                    }
                  " />
                </b-button>

                <b-button variant="link" @click="promptDelete(item.id)" class="ms-3 p-0 text-danger">
                  <CarbonTrashCan style="
                     {
                      fontsize: '1em';
                    }
                  " />
                </b-button>
              </template>
            </b-table>

            <b-pagination v-model="currentPage" align="center" :total-rows="productData.length" :per-page="perPage"
              aria-controls="result-table" />
          </b-col>

          <b-card v-else bg-variant="light">
            <b-card-text class="text-center"> ไม่พบรายการสินค้า </b-card-text>
          </b-card>
        </b-row>
      </b-container>
    </div>
  </div>
</template>
