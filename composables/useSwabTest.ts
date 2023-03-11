import { useRepo } from "pinia-orm";
import SwabTest from "~~/models/SwabTest";

export type ConnectImportTransaction = {
  id: string;
};

export type ConnectBacteria = {
  id: string;
};

export type ImportProductScheduleData = {
  bacteria: ConnectBacteria[];
  swabTestCode: string;
  swabTestRecordedAt: string;
  bacteriaRecordedAt: string;
};

export type BodyImportSwabTest = {
  importTransaction: ConnectImportTransaction;
  records: ImportProductScheduleData[];
  timezone?: string;
};

export const useSwabTest = () => {
  const { get, post, put, destroy } = useRequest();

  const swabTestRepo = useRepo(SwabTest);

  const getSwabTestById = (id: string): SwabTest => {
    const query = swabTestRepo.find(id);
    console.log(query);

    return query;
  };

  const getSwabTestByIds = (ids: string[]): SwabTest[] => {
    const query = swabTestRepo.where("id", ids);

    return query.orderBy("id", "asc").get();
  };

  const getSwabTestByCode = (code: string): SwabTest => {
    const query = swabTestRepo.where("swabTestCode", code);

    return query.first();
  };

  const getSwabTestByCodes = (codes: string[]): SwabTest[] => {
    const query = swabTestRepo.where("swabTestCode", codes);

    return query.orderBy("swabTestCode", "asc").get();
  };

  const loadAllSwabTest = async (): Promise<SwabTest[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<SwabTest[]>("/swab-test");

      watch(data, (swabTestData) => {
        const swabTests = swabTestRepo.save(swabTestData);

        resolve(swabTests);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab test failed");
      });
    });
  };

  const importSwabTest = async (body: BodyImportSwabTest): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/swab-test/import`, {
        ...body,
        timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
      });

      watch(data, resolve);

      watch(error, reject);
    });
  };

  return {
    getSwabTestById,
    getSwabTestByIds,
    getSwabTestByCode,
    getSwabTestByCodes,
    api() {
      return {
        loadAllSwabTest,
        importSwabTest,
      };
    },
  };
};
