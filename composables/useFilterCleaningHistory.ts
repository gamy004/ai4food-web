import { useDate, Shift, DateRangeInterface } from "./useDate";
import { SearchParams } from "./useRequest";
import { SwabStatus } from "./useSwab";

export interface LoadCleaningHistoryFilter {
  id?: string;
  date?: string;
  dateRange?: DateRangeInterface;
  shift?: Shift;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  skip?: number;
  take?: number;
}

export const useFilterCleaningHistory = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadCleaningHistoryFilter): SearchParams => {
    const {
      id,
      date,
      dateRange,
      shift,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      skip,
      take,
    } = data;

    const params: any = {};

    if (id) {
      params.id = id;
    }

    if (date) {
      params.date = onlyDate(new Date(date));
    }

    if (dateRange) {
      params.fromDate = onlyDate(new Date(dateRange.from));
      params.toDate = onlyDate(new Date(dateRange.to));
    }

    if (shift && shift !== Shift.ALL) {
      params.shift = shift;
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
