import { SearchParams } from "./useRequest";

export interface LoadSwabTestFilter {
  importTransactionId?: string;
}

export const useFilterSwabTest = () => {
  const toDto = (data: LoadSwabTestFilter): SearchParams => {
    const { importTransactionId } = data;

    const params: any = {};

    if (importTransactionId) {
      params.importTransactionId = importTransactionId;
    }

    return params;
  };

  return {
    toDto,
  };
};
