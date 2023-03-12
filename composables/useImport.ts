import { useRepo } from "pinia-orm";
import File from "~~/models/File";
import ImportTransaction from "~~/models/ImportTransaction";
import { LoadImportTransactionFilter } from "./useFilterImportTransaction";
import { SearchParams } from "./useRequest";

export type ConnectUser = {
  id: string;
};

export type ConnectFile = {
  id: string;
};

export interface LoadTransactionsResponse {
  total: number;
  importTransactions: ImportTransaction[];
}

export type BodyImportTransaction = {
  importType: string;
  importSource: string;
  importedFileUrl: string;
  importedFileName: string;
  importedFile?: ConnectFile;
  importedUser: ConnectUser;
};

export type BodyUpdateTransaction = {
  importedFileUrl?: string;
  importedFileName?: string;
  importedFile?: ConnectFile;
};

export type BodyCreateFile = {
  fileKey: string;
  fileName: string;
  fileSource: string;
  fileContentType: string;
  fileSize: number;
  user: ConnectUser;
};

export const useImport = () => {
  const { get, post, put } = useRequest();
  const fileRepo = useRepo(File);
  const importTransactionRepo = useRepo(ImportTransaction);

  const getImportTransactionById = (id: string): ImportTransaction | null => {
    return importTransactionRepo.find(id);
  };

  const createFile = (body: BodyCreateFile): Promise<File> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<File>(`/file`, {
        ...body,
      });

      watch(data, (responseData: File) => {
        const file = fileRepo.save(responseData);

        resolve(file);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const loadTransactions = (
    filter: LoadImportTransactionFilter
  ): Promise<LoadTransactionsResponse> => {
    return new Promise((resolve, reject) => {
      const { toDto } = useFilterImportTransaction();

      const params: SearchParams = toDto(filter);

      const { data, error } = get<LoadTransactionsResponse>(
        "/import-transaction",
        { params }
      );

      watch(data, (responseData: LoadTransactionsResponse) => {
        let { total = 0, importTransactions = [] } = responseData;

        importTransactions = importTransactionRepo.save(importTransactions);

        resolve({
          total,
          importTransactions,
        });
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const createTransaction = (body: BodyImportTransaction): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/import-transaction`, {
        ...body,
      });

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const updateTransaction = (
    id: string,
    body: BodyUpdateTransaction
  ): Promise<ImportTransaction> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<ImportTransaction>(
        `/import-transaction/${id}`,
        {
          ...body,
        }
      );

      watch(data, (responseData: ImportTransaction) => {
        const importTransaction = importTransactionRepo.save(responseData);

        resolve(importTransaction);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const completeTransaction = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<any>(
        `/import-transaction/${id}/complete`,
        {}
      );

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const cancelTransaction = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<any>(`/import-transaction/${id}/cancel`, {});

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  return {
    getImportTransactionById,
    api() {
      return {
        createFile,
        loadTransactions,
        createTransaction,
        updateTransaction,
        completeTransaction,
        cancelTransaction,
      };
    },
  };
};
