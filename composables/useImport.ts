import { useRepo } from "pinia-orm";
const { today } = useDate();

export interface BodyImportTransaction {
    importType: string,
    importSource: string,
    importedFileUrl: string,
    importedFileName: string,
    importedUser: {
      id: string
    }
  }

export const useImport = () => {
  const { post } = useRequest();
  const { timePickerToTimeString } = useDate();
  

  const imortTransaction = (body: BodyImportTransaction): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log(body);
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


  return {

    api() {
      return {
        imortTransaction
      };
    },
  };
};
