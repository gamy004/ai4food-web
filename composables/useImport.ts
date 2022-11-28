export type ConnectUser = {
  id: string;
};

export type BodyImportTransaction = {
  importType: string;
  importSource: string;
  importedFileUrl: string;
  importedFileName: string;
  importedUser: ConnectUser;
};

export const useImport = () => {
  const { post, put } = useRequest();

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
    api() {
      return {
        createTransaction,
        completeTransaction,
        cancelTransaction,
      };
    },
  };
};
