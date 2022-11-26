import { useDate, Shift } from "./useDate";
import { SearchParams } from "./useRequest";

export interface LoadAllSwabProductHistoryFilter {
  date: string;
  shift?: Shift;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  productId?: string;
  hasBacteria?: boolean;
}

export const useFilterSwabProductHistory = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadAllSwabProductHistoryFilter): SearchParams => {
    const {
      date,
      shift,
      facilityId,
      facilityItemId,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      productId,
      hasBacteria,
    } = data;

    const params: any = {
      swabProductDate: onlyDate(new Date(date)),
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

    return params;
  };

  return {
    toDto,
  };
};
