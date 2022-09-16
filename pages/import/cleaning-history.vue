<script lang="ts">
import { defineComponent, Ref } from "vue";
import { utils } from "xlsx";
import { useXlsx } from "~~/composables/useXlsx";

export default defineComponent({
  setup () {
    const { readFile, workbook } = useXlsx();

    return {
      readFile,
      readZoneRoom () {
        if (workbook && workbook.value) {
          const { Sheets = {} } = workbook.value;
          const sheetNames = workbook.value.SheetNames;
          const last_row = 18; // last row of schedule xlsx file
          const jsonResults = {};
          let zoneRoom = null;
          console.log(sheetNames);
          sheetNames.slice(0, 1).forEach((sheetName) => {
            //  test slicing for W1 sheet
            console.log(sheetName);
            const range = utils.decode_range(Sheets[sheetName]["!ref"]);
            let time = Sheets[sheetName].A2.w;
            time = time.trim().split(" ")[1];
            time = time.split("-");
            const month = time[1].split("/");
            const startTime = time[0] + "/" + month[1] + "/" + month[2];
            const endTime = month[0] + "/" + month[1] + "/" + month[2];
            console.log(startTime, endTime);

            console.log(range.s.r, range.e.c);
            // get room and zone
            zoneRoom = utils.sheet_to_json(Sheets[sheetName], {
              range: utils.encode_range({
                s: { c: 1, r: 2 },
                e: { c: 2, r: range.e.r }
              })
            });
            console.log(zoneRoom);
          });
          return zoneRoom;
        }
      },
      readCleaningHistory () {
        if (workbook && workbook.value) {
          const { Sheets = {} } = workbook.value;
          const sheetNames = workbook.value.SheetNames;
          const last_row = 18; // last row of schedule xlsx file
          var jsonResults = [];
          console.log(sheetNames);
          sheetNames.forEach((sheetName) => {
            //  test slicing for W1 sheet
            console.log(sheetName);
            const range = utils.decode_range(Sheets[sheetName]["!ref"]);
            let time = Sheets[sheetName].A2.w;
            console.log(time);
            time = time.trim().split(" ")[1];
            time = time.split("-");
            const month = time[1].split("/");
            console.log(month);
            const startTime = new Date(Number(month[2]), Number(month[1]) - 1, Number(time[0]));
            const endTime = new Date(Number(month[2]), Number(month[1]) - 1, Number(month[0]));
            console.log(startTime, endTime);

            console.log(range.s.r, range.e.c);
            const header = ["Room",
              "ล้างประจำวัน (ตามแผนผลิตปกติ)",
              "Std. เวลาล้าง ประจำวัน (ชั่วโมง)",
              "ล้างประจำสัปดาห์ (ตามแผนผลิตปกติ)",
              "Std. เวลาล้างประจำสัปดาห์(ชั่วโมง)"];
            const timeHdr = [];
            const defaultHdr = ["เริ่ม", "เสร็จ", "รวมเวลาล้าง(ชั่วโมง)", "เวลา Diff จาก STD", "% ที่ล้างไลน์จริง"];
            for (let d = startTime; d <= endTime; d.setDate(d.getDate() + 1)) {
              const date = d.toLocaleDateString("en-US");
              const newDay = defaultHdr.map(el => date + "_day_" + el);
              const newNight = defaultHdr.map(el => date + "_night_" + el);
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
                  e: { c: range.e.c, r: R }
                })
              })[0];
              try {
                if (history[header[5]] !== undefined && history[header[5]] !== null) {
                  // for each room
                  console.log(history[header[5]], history.Room);
                  timeHdr.forEach((t) => {
                    const ts = t.split("_");
                    if (["เริ่ม"].includes(ts[2])) {
                      jsonResults.push({
                        room_id: history.Room,
                        cleaning_date: ts[0],
                        cleaning_started_at: history[t],
                        cleaning_end_at: history[ts[0] + "_" + ts[1] + "_เสร็จ"]
                      });
                    }
                  });
                }
              } catch (e) {
                console.log(e);
              }
            }
          });
        }
        return jsonResults;
      }
    };
  }
});
</script>

<template>
  <div>
    <h1>Cleaning History Import Page</h1>

    <input id="fileInput" type="file" @change="readFile">

    <pre>{{ readCleaningHistory() }}</pre>
    <!--  ตัวอย่างเวลาการ ล้างไลน์ .xlsx -->
  </div>
</template>
