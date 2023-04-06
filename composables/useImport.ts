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

  const createFile = async (body: BodyCreateFile): Promise<File> => {
    const data = await post<File>(`/file`, {
      ...body,
    });

    const file = fileRepo.save(data);

    return file;
  };

  const loadTransactions = async (
    filter: LoadImportTransactionFilter
  ): Promise<LoadTransactionsResponse> => {
    const { toDto } = useFilterImportTransaction();

    const params: SearchParams = toDto(filter);

    let { total = 0, importTransactions: data = [] } =
      await get<LoadTransactionsResponse>("/import-transaction", {
        params: { ...params, timezone: "Asia/Bangkok" },
      });

    const importTransactions = importTransactionRepo.save(data);

    return {
      total,
      importTransactions,
    };
  };

  const createTransaction = async (
    body: BodyImportTransaction
  ): Promise<ImportTransaction> => {
    const data = await post<ImportTransaction>(`/import-transaction`, body);

    const importTransaction = importTransactionRepo.save(data);

    return importTransaction;
  };

  const updateTransaction = async (
    id: string,
    body: BodyUpdateTransaction
  ): Promise<ImportTransaction> => {
    const data = await put<ImportTransaction>(
      `/import-transaction/${id}`,
      body
    );

    const importTransaction = importTransactionRepo.save(data);

    return importTransaction;
  };

  const completeTransaction = async (id: string): Promise<void> => {
    await put<void>(`/import-transaction/${id}/complete`, {});
  };

  const cancelTransaction = async (id: string): Promise<void> => {
    await put<void>(`/import-transaction/${id}/cancel`, {});
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
