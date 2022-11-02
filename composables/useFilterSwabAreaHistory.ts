import { Shift } from "./useDate";
import { SearchParams } from "./useRequest";

export interface LoadAllSwabAreaHistoryFilter {
  date: string;
  shift?: Shift;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  skip?: number;
  take?: number;
}

export const useFilterSwabAreaHistory = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadAllSwabAreaHistoryFilter): SearchParams => {
    const {
      date,
      shift,
      facilityId,
      facilityItemId,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      skip,
      take,
    } = data;

    const params: any = {
      swabAreaDate: onlyDate(new Date(date)),
    };

    if (shift && shift !== Shift.ALL) {
      params.shift = shift;
    }

    if (facilityId) {
      params.facilityId = facilityId;
    }

    if (facilityItemId) {
      params.facilityItemId = facilityItemId;
    }

    if (mainSwabAreaId) {
      params.mainSwabAreaId = mainSwabAreaId;
    }

    if (swabPeriodId) {
      params.swabPeriodId = swabPeriodId;
    }

    if (swabTestCode) {
      params.swabTestCode = swabTestCode;
    }

    if (skip) {
      params.skip = skip;
    }

    if (take) {
      params.take = take;
    }

    return params;
  };

  return {
    toDto,
  };
};
