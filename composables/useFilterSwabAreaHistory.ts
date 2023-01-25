import { useDate, Shift, DateRangeInterface } from "./useDate";
import { SearchParams } from "./useRequest";

export interface LoadAllSwabAreaHistoryFilter {
  date?: string;
  dateRange?: DateRangeInterface;
  shift?: Shift;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  hasBacteria?: boolean;
  skip?: number;
  take?: number;
}

export const useFilterSwabAreaHistory = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadAllSwabAreaHistoryFilter): SearchParams => {
    const {
      date,
      dateRange,
      shift,
      facilityId,
      facilityItemId,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      hasBacteria,
      skip,
      take,
    } = data;

    const params: any = {};

    if (date) {
      params.swabAreaDate = onlyDate(new Date(date));
    }

    if (dateRange) {
      params.fromDate = onlyDate(new Date(dateRange.from));
      params.toDate = onlyDate(new Date(dateRange.to));
    }

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
      params.swabAreaId = mainSwabAreaId;
    }

    if (swabPeriodId) {
      params.swabPeriodId = swabPeriodId;
    }

    if (swabTestCode) {
      params.swabTestCode = swabTestCode;
    }

    if (hasBacteria) {
      params.hasBacteria = true;
    }

    if (skip !== undefined) {
      params.skip = skip;
    }
    if (take !== undefined) {
      params.take = take;
    }

    return params;
  };

  return {
    toDto,
  };
};
