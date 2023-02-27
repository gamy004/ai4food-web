import { map, get, groupBy } from "lodash";
import { helpers } from "@vuelidate/validators";
import { isDate } from "date-fns";

export const useValidationRule = () => {
  const duplicateFields = (fields) =>
    helpers.withParams(
      { type: "duplicateFields", value: fields },
      (value: object[]) => {
        const isRequired = helpers.req(value);

        let isDuplicated = false;

        if (isRequired) {
          const validValue = value.filter((record) => {
            return fields.every((field) => {
              const fieldValue = get(record, field);

              return (
                fieldValue !== undefined &&
                fieldValue !== null &&
                fieldValue.length > 0
              );
            });
          });

          const groupedRecords = groupBy(validValue, (record) => {
            return fields.reduce((acc, field) => {
              return `${acc}_${get(record, field)}`;
            }, "");
          });

          for (const key in groupedRecords) {
            if (Object.prototype.hasOwnProperty.call(groupedRecords, key)) {
              const groupedRecord = groupedRecords[key];

              if (groupedRecord.length > 1) {
                isDuplicated = true;

                break;
              }
            }
          }
        }

        return !isRequired || !isDuplicated;
      }
    );

  const dateGreaterThan = (comparedDate: Date) =>
    helpers.withParams(
      { type: "dateGreaterThan", value: comparedDate },
      (targetDate: Date) => {
        const isTargetDateRequired = helpers.req(targetDate);

        const isDateGreaterThan =
          targetDate &&
          comparedDate &&
          targetDate.getTime() > comparedDate.getTime();

        return !isTargetDateRequired || (comparedDate && isDateGreaterThan);
      }
    );

  // const dateGreaterThanOrEqual = (comparedDate: Date) =>
  //   helpers.withParams(
  //     { type: "dateGreaterThanOrEqual", value: comparedDate },
  //     (targetDate: Date) => {
  //       return (
  //         targetDate &&
  //         comparedDate &&
  //         targetDate.getTime() >= comparedDate.getTime()
  //       );
  //     }
  //   );

  const dateLesserThan = (comparedDate: Date) =>
    helpers.withParams(
      { type: "dateLesserThan", value: comparedDate },
      (targetDate: Date) => {
        const isTargetDateRequired = helpers.req(targetDate);

        const isDateLesserThan =
          targetDate &&
          comparedDate &&
          targetDate.getTime() < comparedDate.getTime();

        return !isTargetDateRequired || (comparedDate && isDateLesserThan);
      }
    );

  //   const dateLesserThan = (comparedDate: Date) =>
  //     helpers.withParams(
  //       { type: "dateLesserThan", value: comparedDate },
  //       (targetDate: Date) => {
  //         console.log();

  //         // console.log(
  //         //   targetDate,
  //         //   comparedDate,
  //         //   targetDate.getTime() > comparedDate.getTime()
  //         // );

  //         return (
  //           targetDate &&
  //           comparedDate &&
  //           targetDate.getTime() < comparedDate.getTime()
  //         );
  //       }
  //     );

  // const dateLesserThanOrEqual = (comparedDate: Date) =>
  //   helpers.withParams(
  //     { type: "dateLesserThanOrEqual", value: comparedDate },
  //     (targetDate: Date) => {
  //       return (
  //         targetDate &&
  //         comparedDate &&
  //         targetDate.getTime() <= comparedDate.getTime()
  //       );
  //     }
  //   );

  return {
    duplicateFields,
    dateGreaterThan,
    // dateGreaterThanOrEqual,
    dateLesserThan,
    // dateLesserThanOrEqual,
  };
};
