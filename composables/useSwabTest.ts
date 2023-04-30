import { Item, useRepo } from "pinia-orm";
import SwabTest from "~~/models/SwabTest";
import { LoadSwabTestFilter } from "./useFilterSwabTest";
import { SearchParams } from "./useRequest";

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
  const { get, post } = useRequest();

  const swabTestRepo = useRepo(SwabTest);

  const getSwabTestById = (id: string): Item<SwabTest> => {
    const swabTest = swabTestRepo.find(id);

    return swabTest;
  };

  const getSwabTestByIds = (ids: string[]): SwabTest[] => {
    const query = swabTestRepo.where("id", ids);

    return query.orderBy("id", "asc").get();
  };

  const getSwabTestByCode = (code: string): Item<SwabTest> => {
    const query = swabTestRepo.where("swabTestCode", code);

    return query.first();
  };

  const getSwabTestByCodes = (codes: string[]): SwabTest[] => {
    const query = swabTestRepo.where("swabTestCode", codes);

    return query.orderBy("swabTestCode", "asc").get();
  };

  const loadSwabTest = async (
    filter: LoadSwabTestFilter
  ): Promise<SwabTest[]> => {
    const { toDto } = useFilterSwabTest();

    const params: SearchParams = toDto(filter);

    const data = await get<SwabTest[]>("/swab-test", { params });

    const swabTests = swabTestRepo.save(data);

    return swabTests;
  };

  const loadSwabTestByCodes = async (
    swabTestCodes = []
  ): Promise<SwabTest[]> => {
    const data = await post<SwabTest[]>("/swab-test/codes", {
      swabTestCodes,
    });

    const swabTests = swabTestRepo.save(data);

    return swabTests;
  };

  const importSwabTest = async (body: BodyImportSwabTest): Promise<any> => {
    const data = await post<any>(`/swab-test/import`, {
      ...body,
      timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
    });

    return data;
  };

  return {
    getSwabTestById,
    getSwabTestByIds,
    getSwabTestByCode,
    getSwabTestByCodes,
    api() {
      return {
        loadSwabTest,
        importSwabTest,
        loadSwabTestByCodes,
      };
    },
  };
};
