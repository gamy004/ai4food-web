import { useRepo } from "pinia-orm";
import CleaningHistory, { CleaningType } from "~~/models/CleaningHistory";
import CleaningHistoryValidation from "~~/models/CleaningHistoryValidation";
import CleaningProgram from "~~/models/CleaningProgram";
import { Shift, TimePickerData } from "./useDate";
import { LoadCleaningHistoryFilter } from "./useFilterCleaningHistory";
import { SearchParams } from "./useRequest";

export type ConnectImportTransaction = {
  id: string;
};

export type ConnectRoom = {
  id: string;
};

export type ImportCleaningRoomHistoryData = {
  cleaningRoomDate: string;
  cleaningRoomStartedAt: string;
  cleaningRoomEndedAt: string;
  room: ConnectRoom;
  shift: Shift;
};

export type BodyImportCleaningRoomHistory = {
  importTransaction: ConnectImportTransaction;
  records: ImportCleaningRoomHistoryData[];
  timezone?: string;
};

export interface LoadCleaningHistoryResponse {
  total: number;
  cleaningHistories: CleaningHistory[];
}

export interface ConectCleaningProgramData {
  id: string;
}

export interface UpdateCleaningHistoryBody
  extends UpdateCleaningHistoryValidationBody {
  cleaningHistoryStartedAt: Date | null;
  cleaningHistoryStartedAtDate: string | null;
  cleaningHistoryStartedAtTime: TimePickerData | null;
  cleaningHistoryEndedAt: Date | null;
  cleaningHistoryEndedAtDate: string | null;
  cleaningHistoryEndedAtTime: TimePickerData | null;
  cleaningProgram: ConectCleaningProgramData | null;
  cleaningType: CleaningType | null;
}

export interface UpdateCleaningHistoryValidationBody {
  cleaningHistoryValidations: UpsertCleaningHistoryValidationData[];
}

export interface UpsertCleaningHistoryValidationData {
  id?: string;
  cleaningValidationId: string;
  pass: boolean;
}

export const useCleaning = () => {
  const { get, post, put } = useRequest();
  const cleaningProgramRepo = useRepo(CleaningProgram);
  const cleaningHistoryRepo = useRepo(CleaningHistory);

  const getCleaningHistoryById = (id: string) => {
    return cleaningHistoryRepo.find(id);
  };

  const getCleaningHistoryBySwabAreaHistoryId = (swabAreaHistoryId) => {
    return cleaningHistoryRepo
      .query()
      .where("swabAreaHistoryId", swabAreaHistoryId)
      .first();
  };

  const getCleaningProgramByNames = (names: string[]) => {
    return names
      .map((name) => {
        return cleaningProgramRepo.where("cleaningProgramName", name).first();
      })
      .filter(Boolean);
  };

  const loadCleaningHistoryValidationToCleaningHistory = (
    cleaningHistory: CleaningHistory
  ): CleaningHistory => {
    cleaningHistoryRepo
      .with("cleaningHistoryValidations")
      .load([cleaningHistory]);

    return cleaningHistory;
  };

  const importCleaningRoomHistory = async (
    body: BodyImportCleaningRoomHistory
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/cleaning-room-history/import`, {
        ...body,
        timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
      });

      watch(data, resolve);

      watch(error, reject);
    });
  };

  const loadCleaningProgram = async (): Promise<CleaningProgram[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<CleaningProgram[]>(`/cleaning-program`);

      watch(data, (cleaningPrograms: CleaningProgram[]) => {
        cleaningPrograms = cleaningProgramRepo.save(cleaningPrograms);

        resolve(cleaningPrograms);
      });

      watch(error, reject);
    });
  };

  const loadCleaningHistory = async (
    filter: LoadCleaningHistoryFilter
  ): Promise<LoadCleaningHistoryResponse> => {
    return new Promise((resolve, reject) => {
      const { toDto } = useFilterCleaningHistory();

      const params: SearchParams = toDto(filter);

      const { data, error } = get<LoadCleaningHistoryResponse>(
        `/cleaning-history`,
        { params }
      );

      watch(data, (responseData: LoadCleaningHistoryResponse) => {
        let { cleaningHistories = [], total = 0 } = responseData;

        cleaningHistories = cleaningHistoryRepo.save(cleaningHistories);

        resolve({ cleaningHistories, total });
      });

      watch(error, reject);
    });
  };

  const loadCleaningHistoryById = async (
    id: string
  ): Promise<CleaningHistory> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<CleaningHistory>(`/cleaning-history/${id}`);

      watch(data, (responseData: CleaningHistory) => {
        const cleaningHistory = cleaningHistoryRepo.save(responseData);

        resolve(cleaningHistory);
      });

      watch(error, reject);
    });
  };

  const updateCleaningHistory = async (
    id: string,
    body: UpdateCleaningHistoryBody
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const {
        cleaningHistoryStartedAt = null,
        cleaningHistoryEndedAt = null,
        cleaningProgram = null,
        cleaningType = null,
        cleaningHistoryValidations = [],
      } = body;

      const requestBody: any = {};

      if (cleaningHistoryStartedAt) {
        requestBody.cleaningHistoryStartedAt = cleaningHistoryStartedAt;
      }

      if (cleaningHistoryEndedAt) {
        requestBody.cleaningHistoryEndedAt = cleaningHistoryEndedAt;
      }

      if (cleaningProgram) {
        requestBody.cleaningProgramId = cleaningProgram.id;
      }

      if (cleaningType) {
        requestBody.cleaningType = cleaningType;
      }

      if (cleaningHistoryValidations.length) {
        requestBody.cleaningHistoryValidations = [
          ...cleaningHistoryValidations,
        ];
      }

      const { data, error } = put<any>(`/cleaning-history/${id}`, requestBody);

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, reject);
    });
  };

  return {
    getCleaningProgramByNames,
    getCleaningHistoryById,
    getCleaningHistoryBySwabAreaHistoryId,
    loadCleaningHistoryValidationToCleaningHistory,
    api() {
      return {
        importCleaningRoomHistory,
        loadCleaningProgram,
        loadCleaningHistory,
        loadCleaningHistoryById,
        updateCleaningHistory,
      };
    },
  };
};
