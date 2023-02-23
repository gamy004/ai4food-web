import { useRepo } from "pinia-orm";
import { Shift, TimePickerData } from "./useDate";
import { UpsertFileData } from "./useUpload";
import LabTest from "~~/models/LabTest";
import SwabArea from "~~/models/SwabArea";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import SwabAreaHistoryEnvironment from "~~/models/SwabAreaHistoryEnvironment";
import SwabAreaHistoryImage from "~~/models/SwabAreaHistoryImage";
import SwabEnvironment from "~~/models/SwabEnvironment";
import SwabPeriod from "~~/models/SwabPeriod";
import SwabTest from "~~/models/SwabTest";
import SwabProductHistory from "~~/models/SwabProductHistory";
import FacilityItem from "~~/models/FacilityItem";
import Product from "~~/models/Product";
import { ResponseErrorT, SearchParams } from "./useRequest";
import {
  LoadAllSwabProductHistoryFilter,
  useFilterSwabProductHistory,
} from "./useFilterSwabProductHistory";
import Facility from "~~/models/Facility";
import {
  LoadAllSwabAreaHistoryFilter,
  useFilterSwabAreaHistory,
} from "./useFilterSwabAreaHistory";

// export interface LoadSwabAreaHistoryData {
//   date: string;
//   shift: Shift;
//   facilityId: string;
//   mainSwabAreaId: string;
//   swabPeriodId: string;
// }

// export interface LoadSwabProductHistoryData {
//   date: string;
//   shift: Shift;
//   facilityId: string;
//   facilityItemId: string;
//   swabPeriodId: string;
// }
export enum SwabStatus {
  NOT_RECORDED = "notRecorded",
  PENDING = "pending",
  DETECTED = "detected",
  NORMAL = "normal",
  ALL = "all",
}

export enum SwabStatusMapper {
  notRecorded = "ยังไม่ได้ตรวจ",
  pending = "รอผล",
  detected = "พบเชื้อ",
  normal = "ปกติ",
  all = "ทั้งหมด",
}

export interface LoadSwabProductHistoryResponse {
  facilities: Facility[];
  facilityItems: FacilityItem[];
  products: Product[];
  swabProductHistories: SwabProductHistory[];
  total: number;
}

export interface LoadSwabAreaHistoryResponse {
  total: number;
  // facilities: Facility[];
  // swabAreas: SwabArea[];
  // facilityItems: FacilityItem[];
  swabAreaHistories: SwabAreaHistory[];
  // subSwabAreaHistories: SwabAreaHistory[];
}

export type ConenctProductData = {
  id: string;
};

export type ConnectFacilityData = {
  id: string;
};

export type ConnectFacilityItemData = {
  id: string;
};

export type UpsertSwabEnvironmentData = {
  id?: string;
  swabEnvironmentName?: string;
};

export type UpsertSwabAreaHistoryImageData = {
  id?: string;
  file?: UpsertFileData;
};

export type SubSwabAreasData = {
  swabAreaName?: string;
};

export interface ParamLoadAllMainSwabArea {
  subSwabAreas?: boolean;
  facility?: boolean;
}

export interface BodyManageSwabArea {
  swabAreaName?: string;
  subSwabAreas?: SubSwabAreasData[];
  facility?: ConnectFacilityData;
}

export interface BodyUpdateSwabPlanByIdData {
  swabAreaSwabedAt: TimePickerData;
  product?: ConenctProductData;
  productDate?: string;
  productLot?: string;
  facilityItem?: ConnectFacilityItemData;
  swabAreaTemperature?: number;
  swabAreaHumidity?: number;
  swabEnvironments?: UpsertSwabEnvironmentData[];
  swabAreaHistoryImages?: UpsertSwabAreaHistoryImageData[];
}

export interface BodyCreateSwabProductHistory {
  swabProductDate: string;
  swabProductSwabedAt: TimePickerData;
  swabProductNote?: string | null;
  productLot: string;
  productDate: string;
  product: ConenctProductData;
  facility: ConnectFacilityData;
  facilityItem: ConnectFacilityItemData;
  shift: Shift;
}

export type ResponseSwabAreaDeletePermission = {
  canDelete: boolean;
  message: string;
  countSwabAreaHistories: number;
};

export interface GetSwabPlanResponse {
  // swabPeriods: SwabPeriod[];
  // facilities: Facility[];
  // products: Product[];
  // swabAreas: SwabArea[];
  swabAreaHistories: SwabAreaHistory[];
  swabProductHistories: SwabProductHistory[];
  totalSwabAreaHistories: number;
  totalSwabProductHistories: number;
}

export interface BodyUpdateSwabProductHistory
  extends BodyCreateSwabProductHistory {}

export const useSwab = () => {
  const { get, post, put, destroy } = useRequest();
  const { timePickerToTimeString } = useDate();
  const facilityRepo = useRepo(Facility);
  const facilityItemRepo = useRepo(FacilityItem);
  const productRepo = useRepo(Product);
  const swabAreaRepo = useRepo(SwabArea);
  const swabPeriodRepo = useRepo(SwabPeriod);
  const swabAreaHistoryRepo = useRepo(SwabAreaHistory);
  const swabAreaHistoryImageRepo = useRepo(SwabAreaHistoryImage);
  const swabTestRepo = useRepo(SwabTest);
  const labTestRepo = useRepo(LabTest);
  const swabEnvironmentRepo = useRepo(SwabEnvironment);
  const swabAreaHistoryEnvironmentRepo = useRepo(SwabAreaHistoryEnvironment);
  const swabProductHistoryRepo = useRepo(SwabProductHistory);
  const { today } = useDate();

  const loadAllSwabPeriod = async (): Promise<SwabPeriod[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<SwabPeriod[]>("/swab-period");

      watch(data, (swabPeriodData) => {
        const swabPeriods = swabPeriodRepo.save(swabPeriodData);

        resolve(swabPeriods);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab periods failed");
      });
    });
  };

  const loadAllSwabEnvironment = async (): Promise<SwabEnvironment[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<SwabEnvironment[]>("/swab-environment");

      watch(data, (swabEnvironmentData) => {
        const swabEnvironments = swabEnvironmentRepo.save(swabEnvironmentData);

        resolve(swabEnvironments);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab environments failed");
      });
    });
  };

  const loadAllMainSwabArea = async (
    params: ParamLoadAllMainSwabArea = {}
  ): Promise<SwabArea[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<SwabArea[]>(`/swab/area/main`, { params });

      watch(data, (swabAreaData) => {
        const swabAreas = swabAreaRepo.save(swabAreaData);

        resolve(swabAreas);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load main swab area failed");
      });
    });
  };

  const loadDeletePermissionSwabArea = (
    id: string
  ): Promise<ResponseSwabAreaDeletePermission> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<ResponseSwabAreaDeletePermission>(
        `/swab/area/${id}/delete-permission`
      );

      watch(data, resolve);

      watch(error, reject);
    });
  };

  const createMainSwabArea = (body: BodyManageSwabArea): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/swab/area`, {
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

  const upadateMainSwabArea = (
    id: string,
    body: BodyManageSwabArea
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<any>(`/swab/area/${id}`, body);
      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const deleteMainSwabArea = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = destroy<any>(`/swab/area/${id}`);
      watch(data, (responseData) => {
        const swabAreaId: string = responseData.id;
        const swabAreas = swabAreaRepo.destroy(swabAreaId);
        resolve(swabAreas);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update swab area failed");
      });
    });
  };

  // const loadAllLabSwabAreaHistory = async (
  //   loadAllSwabTestForUpdateData: LoadAllSwabTestForUpdateData
  // ): Promise<SwabAreaHistory[]> => {
  //   return new Promise((resolve, reject) => {
  //     const {
  //       date,
  //       shift,
  //       facilityId,
  //       facilityItemId,
  //       mainSwabAreaId,
  //       swabPeriodId,
  //       swabTestCode,
  //     } = loadAllSwabTestForUpdateData;
  //     const { onlyDate } = useDate();

  //     const params: any = {
  //       swabAreaDate: onlyDate(new Date(date)),
  //     };

  //     if (shift !== Shift.ALL) {
  //       params.shift = shift;
  //     }

  //     if (facilityId) {
  //       params.facilityId = facilityId;
  //     }

  //     if (facilityItemId) {
  //       params.facilityItemId = facilityItemId;
  //     }

  //     if (mainSwabAreaId) {
  //       params.swabAreaId = mainSwabAreaId;
  //     }

  //     if (swabPeriodId) {
  //       params.swabPeriodId = swabPeriodId;
  //     }

  //     if (swabTestCode) {
  //       params.swabTestCode = swabTestCode;
  //     }

  //     const { data, error } = get<SwabAreaHistory[]>("/swab/area-history/lab", {
  //       params,
  //     });

  //     watch(data, (swabAreaHistoryData) => {
  //       // swabAreaHistoryData.map((swabTestData) => {
  //       //   swabAreaHistoryEnvironmentRepo
  //       //     .where("swabTestId", swabTestData.id)
  //       //     .delete();

  //       //   return swabTestData;
  //       // });
  //       console.log(swabAreaHistoryData);

  //       const updatedSwabAreaHistoryData =
  //         swabAreaHistoryRepo.save(swabAreaHistoryData);

  //       resolve(updatedSwabAreaHistoryData);
  //     });

  //     watch(error, (e) => {
  //       console.log(e);

  //       reject("load all lab swab area history failed");
  //     });
  //   });
  // };

  const getSwabPeriodByIds = (ids: string[]) => {
    const query = swabPeriodRepo.where("id", ids);

    return query.get();
  };

  const getSwabPeriodById = (id: string) => {
    return swabPeriodRepo.find(id);
  };

  const getSwabPeriodByNames = (names: string[]) => {
    return names
      .map((name) => {
        return swabPeriodRepo.where("swabPeriodName", name).first();
      })
      .filter(Boolean);
  };

  const getSwabAreaByIds = (ids: string[], filters: any = {}) => {
    const query = swabAreaRepo.where("id", ids);

    if (filters.facilityId) {
      query.where("facilityId", filters.facilityId);
    }

    return query.orderBy("facilityId", "asc").get();
  };

  const getSwabAreaByMainSwabAreaId = (id: string) => {
    const query = swabAreaRepo.where("mainSwabAreaId", id);

    return query.orderBy("createdAt", "asc").get();
  };

  const getSwabAreaById = (id: string): SwabArea => {
    return swabAreaRepo.find(id);
  };

  const getSwabAreaHistoriesByIds = (
    ids: string[],
    filters: any = {}
  ): SwabAreaHistory[] => {
    const query = swabAreaHistoryRepo.where("id", ids);

    return query.orderBy("swabTestId", "asc").get();
  };

  const getSwabAreaHistoryById = (id: string): SwabAreaHistory | null => {
    return swabAreaHistoryRepo.find(id);
  };

  const getSubSwabAreaHistories = (id: string): SwabAreaHistory[] => {
    let subSwabAreaHistories = [];

    const mainSwabAreaHistory = getSwabAreaHistoryById(id);

    if (mainSwabAreaHistory) {
      const subSwabAreaHistoryIds = mainSwabAreaHistory.subSwabAreaHistoryIds;

      subSwabAreaHistories = subSwabAreaHistoryIds.map((subSwabAreaHistoryId) =>
        swabAreaHistoryRepo.find(subSwabAreaHistoryId)
      );
    }

    return subSwabAreaHistories;
  };

  const getSwabProductHistoriesByIds = (
    ids: string[],
    filters: any = {}
  ): SwabProductHistory[] => {
    const query = swabProductHistoryRepo.where("id", ids);

    return query.orderBy("swabTestId", "desc").get();
  };

  const getSwabProductHistoryById = (id: string): SwabProductHistory | null => {
    return swabProductHistoryRepo.find(id);
  };

  const getSwabAreaHistoryImagesByIds = (
    ids: string[],
    filters: any = {}
  ): SwabAreaHistoryImage[] => {
    const query = swabAreaHistoryImageRepo.with("file").where("id", ids);

    return query.get();
  };

  const getSwabEnvironmentByIds = (
    ids: string[],
    filters: any = {}
  ): SwabEnvironment[] => {
    const query = swabEnvironmentRepo.where("id", ids);

    return query.get();
  };

  const getSwabEnvironmentByName = (name: string): SwabEnvironment => {
    const query = swabEnvironmentRepo.where("swabEnvironmentName", name);

    return query.first();
  };

  const getSwabEnvironmentBySwabAreaHistoryId = (
    swabAreaHistoryId: string,
    filters: any = {}
  ): SwabEnvironment[] => {
    let result = [];

    const mapping = swabAreaHistoryEnvironmentRepo
      .query()
      .where("swabAreaHistoryId", swabAreaHistoryId)
      .get();

    if (mapping.length) {
      result = swabEnvironmentRepo
        .where(
          "id",
          mapping.map(({ swabEnvironmentId }) => swabEnvironmentId)
        )
        .get();
    }

    return result;
  };

  const getLabTestById = (id: string): LabTest | null => {
    const query = labTestRepo.where("swabTestId", id);

    return query.first();
  };

  const getSwabTestById = (id: string): SwabTest | null => {
    return swabTestRepo.find(id);
  };

  const loadSwabAreaToSwabAreaHistory = (
    histories: SwabAreaHistory[]
  ): SwabAreaHistory[] => {
    swabAreaHistoryRepo.with("swabArea").load(histories);

    return histories;
  };

  const loadFacilityItemToSwabProductHistory = (
    histories: SwabProductHistory[]
  ): SwabProductHistory[] => {
    swabProductHistoryRepo.with("facilityItem").load(histories);

    return histories;
  };

  const loadProductToSwabProductHistory = (
    histories: SwabProductHistory[]
  ): SwabProductHistory[] => {
    swabProductHistoryRepo.with("product").load(histories);

    return histories;
  };

  const loadCleaningValidationToSwabPeriod = (
    swabPeriod: SwabPeriod
  ): SwabPeriod => {
    swabPeriodRepo.with("cleaningValidations").load([swabPeriod]);

    return swabPeriod;
  };

  const mapPivotSwabAreaEnvironment = (swabAreaHistory) => {
    if (swabAreaHistory.swabEnvironments?.length) {
      swabAreaHistory.swabEnvironments = swabAreaHistory.swabEnvironments.map(
        (swabEnvironment) => ({
          ...swabEnvironment,
          pivot: {
            swabEnvironmentId: swabEnvironment.id,
            swabAreaHistoryId: swabAreaHistory.id,
          },
        })
      );
    }

    return swabAreaHistory;
  };

  const loadSwabAreaHistory = (
    filter: LoadAllSwabAreaHistoryFilter
  ): Promise<SwabAreaHistory[]> => {
    return new Promise((resolve, reject) => {
      const { toDto } = useFilterSwabAreaHistory();

      const params: SearchParams = toDto(filter);

      const { data, error } = get<SwabAreaHistory[]>("/swab/area-history", {
        params,
      });

      watch(data, (swabHistoryForUpdateData) => {
        swabHistoryForUpdateData = swabHistoryForUpdateData.map(
          (swabAreaHistoryData) => {
            swabAreaHistoryEnvironmentRepo
              .where("swabAreaHistoryId", swabAreaHistoryData.id)
              .delete();

            swabAreaHistoryData =
              mapPivotSwabAreaEnvironment(swabAreaHistoryData);

            return swabAreaHistoryData;
          }
        );

        const updatedSwabAreaHistories = swabAreaHistoryRepo.save(
          swabHistoryForUpdateData
        );

        resolve(updatedSwabAreaHistories);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab plan for updating failed");
      });
    });
  };

  const loadSwabAreaHistoryV2 = (
    filter: LoadAllSwabAreaHistoryFilter
  ): Promise<LoadSwabAreaHistoryResponse> => {
    return new Promise((resolve, reject) => {
      const { toDto } = useFilterSwabAreaHistory();

      const params: SearchParams = toDto(filter);

      const { data, error } = get<LoadSwabAreaHistoryResponse>(
        "/swab/area-history/v2",
        { params }
      );

      watch(data, (swabAreaHistoryData: LoadSwabAreaHistoryResponse) => {
        let {
          total = 0,
          // facilities = [],
          // swabAreas = [],
          // facilityItems = [],
          swabAreaHistories = [],
          // subSwabAreaHistories = [],
        } = swabAreaHistoryData;

        // facilities = facilityRepo.save(facilities);

        // swabAreas = swabAreaRepo.save(swabAreas);

        // facilityItems = facilityItemRepo.save(facilityItems);

        swabAreaHistories = swabAreaHistoryRepo.save(swabAreaHistories);

        // subSwabAreaHistories = swabAreaHistoryRepo.save(subSwabAreaHistories);

        resolve({
          total,
          // facilities,
          // swabAreas,
          // facilityItems,
          swabAreaHistories,
          // subSwabAreaHistories,
        });
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  const loadSwabPlanForUpdateById = (id: string): Promise<SwabAreaHistory> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<SwabAreaHistory>(`/swab/area-history/${id}`);

      watch(data, (swabHistoryForUpdateData) => {
        swabAreaHistoryEnvironmentRepo
          .where("swabAreaHistoryId", swabHistoryForUpdateData.id)
          .delete();

        swabHistoryForUpdateData = mapPivotSwabAreaEnvironment(
          swabHistoryForUpdateData
        );

        const updatedSwabAreaHistory = swabAreaHistoryRepo.save(
          swabHistoryForUpdateData
        );

        resolve(updatedSwabAreaHistory);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab plan for updating failed");
      });
    });
  };

  const updateSwabPlanById = (
    swabAreaHistoryId: string,
    body: BodyUpdateSwabPlanByIdData
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<any>(
        `/swab/area-history/${swabAreaHistoryId}`,
        {
          ...body,
          swabAreaSwabedAt: timePickerToTimeString(body.swabAreaSwabedAt),
        }
      );

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update swab plan failed");
      });
    });
  };

  const loadSwabProductHistory = (
    filter: LoadAllSwabProductHistoryFilter
  ): Promise<[SwabProductHistory[], number]> => {
    return new Promise((resolve, reject) => {
      const { toDto } = useFilterSwabProductHistory();

      const params: SearchParams = toDto(filter);

      const { data, error } = get<LoadSwabProductHistoryResponse>(
        "/swab/product-history",
        { params }
      );

      watch(data, (swabProductHistoryData: LoadSwabProductHistoryResponse) => {
        const {
          // facilities = [],
          // facilityItems = [],
          // products = [],
          swabProductHistories = [],
          total = 0,
        } = swabProductHistoryData;

        // facilityRepo.save(facilities);

        // facilityItemRepo.save(facilityItems);

        // productRepo.save(products);

        const updatedSwabProductHistories =
          swabProductHistoryRepo.save(swabProductHistories);

        resolve([updatedSwabProductHistories, total]);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab product history failed");
      });
    });
  };

  const loadSwabProductHistoryById = (
    id: string
  ): Promise<SwabProductHistory> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<SwabProductHistory>(
        `/swab/product-history/${id}`
      );

      watch(data, (swabProductHistoryData: SwabProductHistory) => {
        const updatedSwabProductHistory = swabProductHistoryRepo.save(
          swabProductHistoryData
        );

        resolve(updatedSwabProductHistory);
      });

      watch(error, (e: ResponseErrorT) => {
        reject(e);
      });
    });
  };

  const updateLabTestById = (
    swabTestId: number,
    hasBacteria: boolean
  ): Promise<any> => {
    const bacteriaSpecies = [];

    if (hasBacteria) {
      bacteriaSpecies.push({ bacteriaName: "Listeria" });
    }

    return new Promise((resolve, reject) => {
      const { data, error } = put<any>(`/swab-test/${swabTestId}`, {
        swabTestRecordedAt: today().toISOString(),
        bacteriaSpecies,
      });

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update lab test failed");
      });
    });
  };

  const createSwabProductHistory = (
    body: BodyCreateSwabProductHistory
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/swab/product-history`, {
        ...body,
        swabProductSwabedAt: timePickerToTimeString(body.swabProductSwabedAt),
      });

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Create swab product history failed");
      });
    });
  };

  const updateSwabProductHistory = (
    id: string,
    body: BodyUpdateSwabProductHistory
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<any>(`/swab/product-history/${id}`, {
        ...body,
        swabProductSwabedAt: timePickerToTimeString(body.swabProductSwabedAt),
      });

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update swab product history failed");
      });
    });
  };

  const deleteSwabProductHistory = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = destroy<any>(`/swab/product-history/${id}`);

      watch(data, (responseData) => {
        resolve(responseData);
      });

      watch(error, (e) => {
        reject(e);
      });
    });
  };

  return {
    getSwabPeriodById,

    getSwabPeriodByIds,

    getSwabPeriodByNames,

    getSwabAreaById,

    getSwabAreaByIds,

    getSwabAreaByMainSwabAreaId,

    getSwabAreaHistoriesByIds,

    getSwabAreaHistoryById,

    getSubSwabAreaHistories,

    getSwabProductHistoriesByIds,

    getSwabProductHistoryById,

    getLabTestById,

    getSwabTestById,

    getSwabAreaHistoryImagesByIds,

    getSwabEnvironmentByIds,

    getSwabEnvironmentByName,

    getSwabEnvironmentBySwabAreaHistoryId,

    loadSwabAreaToSwabAreaHistory,

    loadFacilityItemToSwabProductHistory,

    loadProductToSwabProductHistory,

    loadCleaningValidationToSwabPeriod,

    api() {
      return {
        loadAllSwabPeriod,
        loadAllSwabEnvironment,
        loadAllMainSwabArea,
        loadDeletePermissionSwabArea,
        createMainSwabArea,
        upadateMainSwabArea,
        deleteMainSwabArea,
        loadSwabAreaHistory,
        loadSwabAreaHistoryV2,
        // loadAllLabSwabAreaHistory,
        loadSwabPlanForUpdateById,
        loadSwabProductHistory,
        loadSwabProductHistoryById,
        updateSwabPlanById,
        updateLabTestById,
        createSwabProductHistory,
        updateSwabProductHistory,
        deleteSwabProductHistory,
      };
    },
  };
};
