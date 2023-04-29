import { useDate, Shift, DateRangeInterface } from "./useDate";
import { SearchParams } from "./useRequest";
import { SwabStatus } from "./useSwab";

export interface LoadAllSwabProductHistoryFilter {
  date?: string;
  dateRange?: DateRangeInterface;
  shift?: Shift;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  productId?: string;
  hasBacteria?: boolean;
  skip?: number;
  take?: number;
  swabStatus?: SwabStatus;
}

export const useFilterSwabProductHistory = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadAllSwabProductHistoryFilter): SearchParams => {
    const {
      date,
      dateRange,
      shift,
      facilityId,
      facilityItemId,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      productId,
      hasBacteria,
      swabStatus,
      skip,
      take,
    } = data;

    const params: any = {};

    if (date) {
      params.swabProductDate = onlyDate(new Date(date));
    }

    if (dateRange) {
      if (dateRange.from) {
        params.fromDate = onlyDate(new Date(dateRange.from));
      }

      if (dateRange.to) {
        params.toDate = onlyDate(new Date(dateRange.to));
      }
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

    if (productId) {
      params.productId = productId;
    }

    if (hasBacteria) {
      params.hasBacteria = true;
    }

    if (swabStatus && swabStatus !== SwabStatus.ALL) {
      params.swabStatus = swabStatus;
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
