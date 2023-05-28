import { Collection, Item, useRepo } from "pinia-orm";
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
import SwabCleaningValidation from "~~/models/SwabCleaningValidation";
import { LoadSwabCleaningValidationFilter } from "./useFilterSwabCleaningValidation";
import ContactZone from "~/models/ContactZone";
import SwabSampleType from "~/models/SwabSampleType";

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

export type ConnectContactZoneData = {
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
  contactZone?: boolean;
}

export interface BodyManageSwabArea {
  swabAreaName?: string;
  subSwabAreas?: SubSwabAreasData[];
  facility: ConnectFacilityData;
  contactZone: ConnectContactZoneData | null;
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
  const contactZoneRepo = useRepo(ContactZone);
  const swabAreaRepo = useRepo(SwabArea);
  const swabPeriodRepo = useRepo(SwabPeriod);
  const swabAreaHistoryRepo = useRepo(SwabAreaHistory);
  const swabAreaHistoryImageRepo = useRepo(SwabAreaHistoryImage);
  const swabTestRepo = useRepo(SwabTest);
  const labTestRepo = useRepo(LabTest);
  const swabEnvironmentRepo = useRepo(SwabEnvironment);
  const swabAreaHistoryEnvironmentRepo = useRepo(SwabAreaHistoryEnvironment);
  const swabProductHistoryRepo = useRepo(SwabProductHistory);
  const swabCleaningValidationRepo = useRepo(SwabCleaningValidation);
  const swabSampleTypeRepo = useRepo(SwabSampleType);
  const { today } = useDate();

  const loadAllSwabPeriod = async (): Promise<SwabPeriod[]> => {
    const data = await get<SwabPeriod[]>("/swab-period");

    const swabPeriods = swabPeriodRepo.save(data);

    return swabPeriods;
  };

  const loadAllContactZone = async (): Promise<ContactZone[]> => {
    const data = await get<ContactZone[]>("/contact-zone");

    const contactZones = contactZoneRepo.save(data);

    return contactZones;
  };

  const loadAllSwabEnvironment = async (): Promise<SwabEnvironment[]> => {
    const data = await get<SwabEnvironment[]>("/swab-environment");

    const swabEnvironments = swabEnvironmentRepo.save(data);

    return swabEnvironments;
  };

  const loadAllMainSwabArea = async (
    params: ParamLoadAllMainSwabArea = {}
  ): Promise<SwabArea[]> => {
    const data = await get<SwabArea[]>(`/swab/area/main`, { params });

    const swabAreas = swabAreaRepo.save(data);

    return swabAreas;
  };

  const loadAllSwabSampleType = async (): Promise<SwabSampleType[]> => {
    const data = await get<SwabSampleType[]>(`/swab-sample-type`);

    const swabSampleTypes = swabSampleTypeRepo.save(data);

    return swabSampleTypes;
  };

  const loadDeletePermissionSwabArea = async (
    id: string
  ): Promise<ResponseSwabAreaDeletePermission> => {
    const data = await get<ResponseSwabAreaDeletePermission>(
      `/swab/area/${id}/delete-permission`
    );

    return data;
  };

  const createMainSwabArea = async (body: BodyManageSwabArea): Promise<any> => {
    const data = await post<SwabArea>(`/swab/area`, {
      ...body,
    });

    const mainSwabArea = swabAreaRepo.save(data);

    return mainSwabArea;
  };

  const upadateMainSwabArea = async (
    id: string,
    body: BodyManageSwabArea
  ): Promise<any> => {
    const data = await put<SwabArea>(`/swab/area/${id}`, body);

    const mainSwabArea = swabAreaRepo.save(data);

    return mainSwabArea;
  };

  const deleteMainSwabArea = async (id: string): Promise<Item<SwabArea>> => {
    const data = await destroy<any>(`/swab/area/${id}`);

    const swabAreaId: string = data.id;

    const swabArea = swabAreaRepo.destroy(swabAreaId);

    return swabArea;
  };

  // const loadAllLabSwabAreaHistory = async (
  //   loadSwabTestForUpdateData: LoadAllSwabTestForUpdateData
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
  //     } = loadSwabTestForUpdateData;
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

  const getAllSwabSampleTypes = () => {
    return swabSampleTypeRepo.all();
  };

  const getAllContactZones = () => {
    return contactZoneRepo.all();
  };

  const getContactZoneByIds = (ids: string[]) => {
    const query = contactZoneRepo.where("id", ids);

    return query.get();
  };

  const getContactZoneByName = (name: string) => {
    const query = contactZoneRepo.where("contactZoneName", name);

    return query.first();
  };

  const getContactZoneById = (id: string) => {
    return contactZoneRepo.find(id);
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

  const getSwabAreaById = (id: string): Item<SwabArea> => {
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

  const getSubSwabAreaHistories = (id: string): Item<SwabAreaHistory>[] => {
    let subSwabAreaHistories: Item<SwabAreaHistory>[] = [];

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

  const getSwabEnvironmentByName = (
    name: string
  ): Item<SwabEnvironment> | null => {
    const query = swabEnvironmentRepo.where("swabEnvironmentName", name);

    return query.first();
  };

  const getSwabEnvironmentBySwabAreaHistoryId = (
    swabAreaHistoryId: string,
    filters: any = {}
  ): Collection<SwabEnvironment> => {
    let result: Collection<SwabEnvironment> = [];

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

  const getSwabSampleTypeById = (id: string): SwabSampleType | null => {
    const query = swabSampleTypeRepo.where("id", id);

    return query.first();
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

  const loadBacteriaToSwabTest = (swabTest: SwabTest): SwabTest => {
    swabTestRepo.with("bacteria").load([swabTest]);

    return swabTest;
  };

  const loadBacteriaSpeciesToSwabTest = (swabTest: SwabTest): SwabTest => {
    swabTestRepo.with("bacteriaSpecies").load([swabTest]);

    return swabTest;
  };

  const mapPivotSwabAreaEnvironment = (swabAreaHistory: any) => {
    if (swabAreaHistory.swabEnvironments?.length) {
      swabAreaHistory.swabEnvironments = swabAreaHistory.swabEnvironments.map(
        (swabEnvironment: any) => ({
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

  const loadSwabAreaHistory = async (
    filter: LoadAllSwabAreaHistoryFilter
  ): Promise<SwabAreaHistory[]> => {
    const { toDto } = useFilterSwabAreaHistory();

    const params: SearchParams = toDto(filter);

    let data = await get<SwabAreaHistory[]>("/swab/area-history", {
      params,
    });

    data = data.map((swabAreaHistoryData) => {
      swabAreaHistoryEnvironmentRepo
        .where("swabAreaHistoryId", swabAreaHistoryData.id)
        .delete();

      swabAreaHistoryData = mapPivotSwabAreaEnvironment(swabAreaHistoryData);

      return swabAreaHistoryData;
    });

    const updatedSwabAreaHistories = swabAreaHistoryRepo.save(data);

    return updatedSwabAreaHistories;
  };

  const loadSwabAreaHistoryV2 = async (
    filter: LoadAllSwabAreaHistoryFilter
  ): Promise<LoadSwabAreaHistoryResponse> => {
    const { toDto } = useFilterSwabAreaHistory();

    const params: SearchParams = toDto(filter);

    const data = await get<LoadSwabAreaHistoryResponse>(
      "/swab/area-history/v2",
      { params }
    );

    let {
      total = 0,
      // facilities = [],
      // swabAreas = [],
      // facilityItems = [],
      swabAreaHistories = [],
      // subSwabAreaHistories = [],
    } = data;

    // facilities = facilityRepo.save(facilities);

    // swabAreas = swabAreaRepo.save(swabAreas);

    // facilityItems = facilityItemRepo.save(facilityItems);

    swabAreaHistories = swabAreaHistoryRepo.save(swabAreaHistories);

    // subSwabAreaHistories = swabAreaHistoryRepo.save(subSwabAreaHistories);

    return {
      total,
      // facilities,
      // swabAreas,
      // facilityItems,
      swabAreaHistories,
      // subSwabAreaHistories,
    };
  };

  const loadSwabPlanForUpdateById = async (
    id: string
  ): Promise<SwabAreaHistory> => {
    let data = await get<SwabAreaHistory>(`/swab/area-history/${id}`);

    swabAreaHistoryEnvironmentRepo.where("swabAreaHistoryId", data.id).delete();

    data = mapPivotSwabAreaEnvironment(data);

    const updatedSwabAreaHistory = swabAreaHistoryRepo.save(data);

    return updatedSwabAreaHistory;
  };

  const updateSwabPlanById = async (
    swabAreaHistoryId: string,
    body: BodyUpdateSwabPlanByIdData
  ): Promise<any> => {
    const data = await put<any>(`/swab/area-history/${swabAreaHistoryId}`, {
      ...body,
      swabAreaSwabedAt: timePickerToTimeString(body.swabAreaSwabedAt),
    });

    return data;
  };

  const loadSwabProductHistory = async (
    filter: LoadAllSwabProductHistoryFilter
  ): Promise<[SwabProductHistory[], number]> => {
    const { toDto } = useFilterSwabProductHistory();

    const params: SearchParams = toDto(filter);

    const data = await get<LoadSwabProductHistoryResponse>(
      "/swab/product-history",
      { params }
    );

    const {
      // facilities = [],
      // facilityItems = [],
      // products = [],
      swabProductHistories = [],
      total = 0,
    } = data;

    // facilityRepo.save(facilities);

    // facilityItemRepo.save(facilityItems);

    // productRepo.save(products);

    const updatedSwabProductHistories =
      swabProductHistoryRepo.save(swabProductHistories);

    return [updatedSwabProductHistories, total];
  };

  const loadSwabProductHistoryById = async (
    id: string
  ): Promise<SwabProductHistory> => {
    const data = await get<SwabProductHistory>(`/swab/product-history/${id}`);

    const updatedSwabProductHistory = swabProductHistoryRepo.save(data);

    return updatedSwabProductHistory;
  };

  const loadSwabCleaningValidation = async (
    filter: LoadSwabCleaningValidationFilter
  ): Promise<SwabCleaningValidation[]> => {
    const { toDto } = useFilterSwabCleaningValidation();

    const params: SearchParams = toDto(filter);

    const data = await get<SwabCleaningValidation[]>(
      `/swab/cleaning-validation`,
      { params }
    );

    const updatedSwabCleaningValidation = swabCleaningValidationRepo.save(data);

    return updatedSwabCleaningValidation;
  };

  const updateLabTestById = async (
    swabTestId: number,
    hasBacteria: boolean
  ): Promise<any> => {
    const bacteriaSpecies = [];

    if (hasBacteria) {
      bacteriaSpecies.push({ bacteriaName: "Listeria" });
    }

    const data = await put<any>(`/swab-test/${swabTestId}`, {
      swabTestRecordedAt: today().toISOString(),
      bacteriaSpecies,
    });

    return data;
  };

  const createSwabProductHistory = async (
    body: BodyCreateSwabProductHistory
  ): Promise<any> => {
    const data = await post<any>(`/swab/product-history`, {
      ...body,
      swabProductSwabedAt: timePickerToTimeString(body.swabProductSwabedAt),
    });

    return data;
  };

  const updateSwabProductHistory = async (
    id: string,
    body: BodyUpdateSwabProductHistory
  ): Promise<any> => {
    const data = await put<any>(`/swab/product-history/${id}`, {
      ...body,
      swabProductSwabedAt: timePickerToTimeString(body.swabProductSwabedAt),
    });

    return data;
  };

  const deleteSwabProductHistory = async (id: string): Promise<any> => {
    const data = await destroy<any>(`/swab/product-history/${id}`);

    return data;
  };

  return {
    getSwabPeriodById,

    getSwabPeriodByIds,

    getSwabPeriodByNames,

    getAllSwabSampleTypes,

    getAllContactZones,

    getContactZoneByIds,

    getContactZoneByName,

    getContactZoneById,

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

    getSwabSampleTypeById,

    getSwabAreaHistoryImagesByIds,

    getSwabEnvironmentByIds,

    getSwabEnvironmentByName,

    getSwabEnvironmentBySwabAreaHistoryId,

    loadSwabAreaToSwabAreaHistory,

    loadFacilityItemToSwabProductHistory,

    loadProductToSwabProductHistory,

    loadCleaningValidationToSwabPeriod,

    loadBacteriaToSwabTest,

    loadBacteriaSpeciesToSwabTest,

    api() {
      return {
        loadAllSwabPeriod,
        loadAllContactZone,
        loadAllSwabEnvironment,
        loadAllMainSwabArea,
        loadAllSwabSampleType,
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
        loadSwabCleaningValidation,
        updateSwabPlanById,
        updateLabTestById,
        createSwabProductHistory,
        updateSwabProductHistory,
        deleteSwabProductHistory,
      };
    },
  };
};
