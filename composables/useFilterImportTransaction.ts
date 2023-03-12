import { ImportSource, ImportType } from "~~/models/ImportTransaction";
import { DateRangeInterface } from "./useDate";
import { SearchParams } from "./useRequest";

export interface LoadImportTransactionFilter {
  dateRange?: DateRangeInterface;
  importSource?: ImportSource;
  importType?: ImportType;
  skip?: number;
  take?: number;
}

export const useFilterImportTransaction = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadImportTransactionFilter): SearchParams => {
    const { dateRange, importSource, importType, skip, take } = data;

    const params: any = {};

    if (dateRange) {
      params.fromDate = onlyDate(new Date(dateRange.from));
      params.toDate = onlyDate(new Date(dateRange.to));
    }

    if (importSource) {
      params.importSource = importSource;
    }

    if (importType) {
      params.importType = importType;
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