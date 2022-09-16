<script lang="ts">
import { defineComponent, Ref } from "vue";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";

export default defineComponent({
  setup () {
    const { readFile, workbook } = useXlsx();

    return {
      readFile,
      readProduct () {
        if (workbook && workbook.value) {
          const { Sheets = {} } = workbook.value;
          const sheetNames = workbook.value.SheetNames;
          const last_row = 18; // last row of schedule xlsx file
          const jsonResults = {};
          /* loop foreach sheetName */
          for (const x in sheetNames) {
            const sheetName = sheetNames[x];
            const range = utils.decode_range(Sheets[sheetName]["!ref"]);
            const time = Sheets[sheetName].A2.w;
            console.log(time);

            range.s.r = 4;
            range.e.r = 5;
            range.s.c = 1;
            let C; const R = range.s.r; /* start in the first row */
            let night_cell = 0;
            const header = ["hr."];
            for (C = range.s.c; C <= range.e.c; ++C) {
              const cell = Sheets[sheetName][utils.encode_cell({ c: C, r: R })]; /* find the cell in the first row */

              let hdr = "UNKNOWN " + C; // <-- replace with your desired default
              if (cell && cell.t) { hdr = utils.format_cell(cell); } else {
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
                    product_id: key,
                    product_schedule_amount: obj[key] ? Number(obj[key]).toFixed(2) : "-",
                    product_schedule_date: sheetName,
                    product_schedule_started_at: startTime,
                    product_schedule_ended_at: endTime
                  };
                  results.push(resultJson);
                }
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
    <h1>Product Schedule Import Page</h1>

    <input id="fileInput" type="file" @change="readFile">

    <pre>{{ readProduct() }}</pre>
  </div>
</template>
