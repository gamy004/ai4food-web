import { groupBy, keyBy } from "lodash";
import { ShiftAbbreviation } from "./useDate";

export const useCustomScript = () => {
  const _transform = (processedData, full = false) => {
    const result = [];
    const resultHeader = ["วันที่", "กะ", "ช่วงตรวจ"];
    const mainSwabAreaNameDict = {};
    const mainSwabAreaNameGroupedBySwabPeriod = {};
    const templateShift = ["D", "N"];
    const templateSwabPeriod = [
      "ก่อน Super Big Cleaning",
      "หลัง Super Big Cleaning",
      "หลังประกอบเครื่อง",
      "ก่อนล้างระหว่างงาน",
      "หลังล้างระหว่างงาน",
      "เดินไลน์หลังพัก 4 ชม.",
      "ก่อนล้างท้ายกะ",
      "หลังล้างท้ายกะ",
    ];

    const dataGroupedByDate = groupBy(processedData, "date");

    const processedDataGroupedByDate = {};

    for (const date in dataGroupedByDate) {
      if (Object.prototype.hasOwnProperty.call(dataGroupedByDate, date)) {
        const dataGroupedByDatePeriod = groupBy(
          dataGroupedByDate[date],
          "swabPeriodName"
        );

        const processedDataGroupedByDatePeriod = {};

        for (const swabPeriodName in dataGroupedByDatePeriod) {
          if (
            Object.prototype.hasOwnProperty.call(
              dataGroupedByDatePeriod,
              swabPeriodName
            )
          ) {
            mainSwabAreaNameGroupedBySwabPeriod[swabPeriodName] = {};

            const dataGroupedByDatePeriodShift = groupBy(
              dataGroupedByDatePeriod[swabPeriodName],
              "shift"
            );

            const processedDataGroupedByDatePeriodShift = {};

            for (const shift in dataGroupedByDatePeriodShift) {
              if (
                Object.prototype.hasOwnProperty.call(
                  dataGroupedByDatePeriodShift,
                  shift
                )
              ) {
                const dataGroupedByDatePeriodShiftArea = keyBy(
                  dataGroupedByDatePeriodShift[shift],
                  "mainSwabAreaName"
                );

                processedDataGroupedByDatePeriodShift[shift] = Object.entries(
                  dataGroupedByDatePeriodShiftArea
                ).reduce((acc, entry) => {
                  const mainSwabAreaName = entry[0];
                  const entryData: any = entry[1];

                  if (
                    !mainSwabAreaNameGroupedBySwabPeriod[swabPeriodName][
                      mainSwabAreaName
                    ]
                  ) {
                    mainSwabAreaNameGroupedBySwabPeriod[swabPeriodName][
                      mainSwabAreaName
                    ] = true;
                  }

                  if (!mainSwabAreaNameDict[mainSwabAreaName]) {
                    mainSwabAreaNameDict[mainSwabAreaName] = true;
                  }

                  return {
                    ...acc,
                    [mainSwabAreaName]:
                      entryData.isListeriaDetected === true ? 1 : 0,
                  };
                }, {});
              }
            }

            processedDataGroupedByDatePeriod[swabPeriodName] =
              processedDataGroupedByDatePeriodShift;
          }
        }

        processedDataGroupedByDate[date] = processedDataGroupedByDatePeriod;
      }
    }
    // Expected output
    // 2022-06-25|ก่อน Super Bigcleaning|... count main swab area that listeria is detected
    let templateSwabArea = Object.keys(mainSwabAreaNameDict);

    // console.log("full:", templateSwabArea);

    if (!full) {
      const filteredTemplateSwabArea = templateSwabArea.filter(
        (swabAreaName) => {
          return Object.values(mainSwabAreaNameGroupedBySwabPeriod).every(
            (swabAreaNameInSwabPeriod) =>
              swabAreaNameInSwabPeriod[swabAreaName] !== undefined
          );
        }
      );

      templateSwabArea = filteredTemplateSwabArea.filter(Boolean);

      // console.log("filtered:", templateSwabArea);
    }

    templateSwabArea.forEach((swabAreaName) => resultHeader.push(swabAreaName));

    for (const date in processedDataGroupedByDate) {
      if (
        Object.prototype.hasOwnProperty.call(processedDataGroupedByDate, date)
      ) {
        const processedDataDate = processedDataGroupedByDate[date];

        templateShift.forEach((shift) => {
          templateSwabPeriod.forEach((swabPeriodName) => {
            if (processedDataDate[swabPeriodName]) {
              const processedDataDatePeriod = processedDataDate[swabPeriodName];

              if (processedDataDatePeriod[shift]) {
                const processedDataDatePeriodShift =
                  processedDataDatePeriod[shift];

                const baseRecord = [date, shift, swabPeriodName];

                templateSwabArea.forEach((swabAreaName) => {
                  baseRecord.push(
                    processedDataDatePeriodShift[swabAreaName] !== undefined
                      ? processedDataDatePeriodShift[swabAreaName]
                      : -1
                  );
                });

                // for (const swabAreaName in mainSwabAreaNameDict) {
                //   if (
                //     Object.prototype.hasOwnProperty.call(
                //       mainSwabAreaNameDict,
                //       swabAreaName
                //     )
                //   ) {
                //     baseRecord.push(
                //       processedDataDatePeriodShift[swabAreaName] !== undefined
                //         ? processedDataDatePeriodShift[swabAreaName]
                //         : -1
                //     );
                //   }
                // }

                result.push(baseRecord.join("|"));
              }
            }
          });
        });
      }
    }

    const joinedHeader = resultHeader.join("|");

    const joinedResult = result.join("\n");

    // console.log(joinedHeader, joinedResult);

    return { header: joinedHeader, result: joinedResult };
  };

  const transformExcelTemplate = (rawData, full = false) => {
    const processedData = rawData.map((record) => {
      const splittedRecord = record
        .split("|")
        .map((value: string) => `${value}`.trim());

      const date = splittedRecord[0];
      const shift = splittedRecord[1];
      const swabTestCode = splittedRecord[2];
      const swabTestSwabedAt = splittedRecord[3];
      // const facility = splittedRecord[4];
      const mainSwabAreaName = splittedRecord[5];
      const swabPeriodName = splittedRecord[6];
      const atpValue = splittedRecord[7];
      const swabEnvironments = [
        splittedRecord[8],
        splittedRecord[9],
        splittedRecord[10],
        splittedRecord[11],
        splittedRecord[12],
      ].filter((swabEnvironment) => swabEnvironment !== "-");

      // console.log(splittedRecord, splittedRecord[12]);

      const isListeriaDetected = splittedRecord[12].toLowerCase() === "yes";
      const bacteriaSpecies = splittedRecord[13].split(",");

      return {
        date,
        shift,
        swabTestCode,
        swabTestSwabedAt,
        mainSwabAreaName,
        swabPeriodName,
        atpValue,
        swabEnvironments,
        isListeriaDetected,
        bacteriaSpecies,
      };
    });

    return _transform(processedData, full);
  };

  const transformViewData = (rawData, full = false) => {
    const processedData = rawData.map((record) => {
      const date = record.swab_area_date;
      const shift = ShiftAbbreviation[record.shift];
      const swabTestCode = null;
      const swabTestSwabedAt = null;
      // const facility = splittedRecord[4];
      const mainSwabAreaName = `${record.facility_name}: ${record.swab_area_name}`;
      const swabPeriodName = record.swab_period_name;
      const atpValue = null;
      const swabEnvironments = [];
      const isListeriaDetected = record.is_detected_listeria === 1;
      const bacteriaSpecies = [];

      return {
        date,
        shift,
        swabTestCode,
        swabTestSwabedAt,
        mainSwabAreaName,
        swabPeriodName,
        atpValue,
        swabEnvironments,
        isListeriaDetected,
        bacteriaSpecies,
      };
    });

    return _transform(processedData, full);
  }

  return {
    transformExcelTemplate,
    transformViewData
  };
};
