import { useRepo } from "pinia-orm";
import { Shift } from "./useDate";

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

export const useCleaning = () => {
    const { get, post, put, destroy } = useRequest();
  
    const ImportCleaningRoomHistory = async (
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
  
    return {
      api() {
        return {
            ImportCleaningRoomHistory,
        };
      },
    };
  };