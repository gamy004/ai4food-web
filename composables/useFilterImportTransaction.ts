import { ImportSource, ImportType } from "~~/models/ImportTransaction";
import { DateRangeInterface } from "./useDate";
import { SearchParams } from "./useRequest";

export interface LoadImportTransactionFilter {
  dateRange?: DateRangeInterface;
  importSource?: ImportSource;
  importType?: ImportType;
  importedFileName?: string;
  skip?: number;
  take?: number;
}

export const useFilterImportTransaction = () => {
  const { onlyDate } = useDate();

  const toDto = (data: LoadImportTransactionFilter): SearchParams => {
    const {
      dateRange,
      importSource,
      importType,
      skip,
      take,
      importedFileName,
    } = data;

    const params: any = {};

    if (dateRange) {
      if (dateRange.from) {
        params.fromDate = onlyDate(new Date(dateRange.from));
      }

      if (dateRange.to) {
        params.toDate = onlyDate(new Date(dateRange.to));
      }
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

    if (importedFileName) {
      params.importedFileName = importedFileName;
    }

    return params;
  };

  return {
    toDto,
  };
};
