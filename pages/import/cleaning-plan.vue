<script lang="ts">
import { defineComponent, Ref } from "vue";
import { utils } from "xlsx";
import { isArray } from "@vue/shared";
import { useXlsx } from "~~/composables/useXlsx";

export default defineComponent({
  setup () {
    const { readFile, workbook } = useXlsx();

    return {
      readFile,
      readPlan () {
        if (workbook && workbook.value) {
          const { Sheets = {} } = workbook.value;
          const sheetNames = workbook.value.SheetNames;
          const last_column = "AM"; // last row of schedule xlsx file
          const jsonResults = {};

          const sheetName = sheetNames[9];
          const range = utils.decode_range(Sheets[sheetName]["!ref"]);

          const year_cell = utils.decode_cell("A1");
          const month_cell = utils.decode_cell("A5");

          const year_value = utils.format_cell(Sheets[sheetName][utils.encode_cell(year_cell)]);
          const year = year_value.split("ปี")[1].trim().split(" ")[0];

          range.s.r = 5;
          range.s.c = 1;

          const C = range.s.c; /* start in the first column */

          const month = Sheets[sheetName][utils.encode_cell(month_cell)];

          const result_json = {};
          for (let R = range.s.r - 1; R <= range.e.r; ++R) {
            const month = Sheets[sheetName][utils.encode_cell({ c: C - 1, r: R })];
            const month_value = utils.format_cell(month);
            if (month_value != "เดือน" && month_value != "") {
              // console.log(utils.format_cell(month))
              const header = ["line"];
              const date_program_dict = {};
              for (let SC = C + 1; SC <= range.e.c; ++SC) {
                const date_cell = Sheets[sheetName][utils.encode_cell({ c: SC, r: R - 1 })];
                const default_program_cell = Sheets[sheetName][utils.encode_cell({ c: SC, r: R })];
                let hdr = "UNKNOWN " + SC;
                if (utils.format_cell(date_cell) != "") {
                  hdr = utils.format_cell(date_cell);
                  date_program_dict[hdr] = utils.format_cell(default_program_cell);
                }
                header.push(hdr);
              }

              const start_range = utils.decode_range(Sheets[sheetName]["!ref"]);
              start_range.s.r = R + 1;
              start_range.e.r = R + 23;
              start_range.s.c = 1;
              start_range.e.c = 38;
              const new_range = utils.encode_range(start_range);
              const facility_result = utils.sheet_to_json(Sheets[sheetName], { header, raw: true, defval: null, range: new_range });
              // console.log(facility_result)
              facility_result.forEach((line) => {
                // console.log(line)
                Object.keys(line).forEach((date) => {
                  if (!isNaN(Number(date))) { line[date] = date_program_dict[date]; }
                });
              });
              result_json[month_value] = facility_result;
            }
          }

          const results = [];
          Object.keys(result_json).forEach((month) => {
            const month_dict = {
              "ม.ค.": 1,
              "ก.พ.": 2,
              "มี.ค.": 3,
              "เม.ย.": 4,
              "พ.ค.": 5,
              "มิ.ย.": 6,
              "ก.ค.": 7,
              "ส.ค.": 8,
              "ก.ย.": 9,
              "ต.ค.": 10,
              "พ.ย.": 11,
              "ธ.ค.": 12
            };

            result_json[month].forEach((obj) => {
              Object.keys(obj).forEach((key) => {
                let resultJson = {};
                if (!isNaN(Number(key))) {
                  resultJson = {
                    cleaning_program: obj[key],
                    cleaning_date: new Date(Number(year), month_dict[month], Number(key))
                  };
                }
                resultJson.facility_name = obj.line;
                results.push(resultJson);
              });
            });
          });
          return results;
        }
      }
    };
  }
});
</script>

<template>
  <div>
    <h1>Cleaning Plan Import Page</h1>

    <input id="fileInput" type="file" @change="readFile">

    <pre>{{ readPlan("สุก") }}</pre>
  </div>
</template>
