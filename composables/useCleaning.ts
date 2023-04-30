import { Item, useRepo } from "pinia-orm";
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

  const getCleaningHistoryBySwabAreaHistoryId = (
    swabAreaHistoryId: string
  ): Item<CleaningHistory> => {
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

  /**
   * @deprecated The method should not be used, feature abandoned
   * @param body
   */
  const importCleaningRoomHistory = async (
    body: BodyImportCleaningRoomHistory
  ): Promise<void> => {
    await post<any>(`/cleaning-room-history/import`, {
      ...body,
      timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
    });
  };

  const loadCleaningProgram = async (): Promise<CleaningProgram[]> => {
    const data = await get<CleaningProgram[]>(`/cleaning-program`);

    const cleaningPrograms = cleaningProgramRepo.save(data);

    return cleaningPrograms;
  };

  const loadCleaningHistory = async (
    filter: LoadCleaningHistoryFilter
  ): Promise<LoadCleaningHistoryResponse> => {
    const { toDto } = useFilterCleaningHistory();

    const params: SearchParams = toDto(filter);

    let { cleaningHistories = [], total = 0 } =
      await get<LoadCleaningHistoryResponse>(`/cleaning-history`, { params });

    cleaningHistories = cleaningHistoryRepo.save(cleaningHistories);

    return { cleaningHistories, total };
  };

  const loadCleaningHistoryById = async (
    id: string
  ): Promise<CleaningHistory> => {
    const data = await get<CleaningHistory>(`/cleaning-history/${id}`);

    const cleaningHistory = cleaningHistoryRepo.save(data);

    return cleaningHistory;
  };

  const updateCleaningHistory = async (
    id: string,
    body: UpdateCleaningHistoryBody
  ): Promise<void> => {
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
      requestBody.cleaningHistoryValidations = [...cleaningHistoryValidations];
    }

    await put<CleaningHistory>(`/cleaning-history/${id}`, requestBody);
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
