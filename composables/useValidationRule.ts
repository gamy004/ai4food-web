import { get, groupBy } from "lodash";
import { helpers } from '@vuelidate/validators';

export const useValidationRule = () => {
    const duplicateFields = (fields) => helpers.withParams(
        { type: 'duplicateFields', value: fields },
        (value: object[]) => {
            const isRequired = helpers.req(value);

            let isDuplicated = false;

            if (isRequired) {
                const groupedRecords = groupBy(value, (record) => {
                    return fields.reduce(
                        (acc, field) => {
                            return `${acc}_${get(record, field)}`;
                        }, ""
                    );
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

  return {
    duplicateFields
  };
};
