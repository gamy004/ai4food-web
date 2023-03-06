import { SearchParams } from "./useRequest";

export interface LoadSwabCleaningValidationFilter {
  swabPeriodId?: string;
  swabAreaId?: string;
}

export const useFilterSwabCleaningValidation = () => {
  const toDto = (data: LoadSwabCleaningValidationFilter): SearchParams => {
    const { swabAreaId, swabPeriodId } = data;

    const params: any = {};

    if (swabPeriodId) {
      params.swabPeriodId = swabPeriodId;
    }

    if (swabAreaId) {
      params.swabAreaId = swabAreaId;
    }

    return params;
  };

  return {
    toDto,
  };
};
