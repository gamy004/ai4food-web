import { useRepo } from "pinia-orm";
import CleaningHistory from "~~/models/CleaningHistory";
import { Shift } from "./useDate";
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

export const useCleaning = () => {
  const { get, post } = useRequest();
  const cleaningHistoryRepo = useRepo(CleaningHistory);

  const getCleaningHistoryById = (id: string) => {
    return cleaningHistoryRepo.find(id);
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

  return {
    getCleaningHistoryById,

    api() {
      return {
        importCleaningRoomHistory,
        loadCleaningHistory,
      };
    },
  };
};
