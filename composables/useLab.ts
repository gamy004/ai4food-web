import { useRepo } from "pinia-orm";
import { filter } from "rxjs";
import Bacteria from "~~/models/Bacteria";
import BacteriaSpecie from "~~/models/BacteriaSpecie";
import Facility from "~~/models/Facility";
import FacilityItem from "~~/models/FacilityItem";
import Product from "~~/models/Product";
import SwabArea from "~~/models/SwabArea";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import SwabPeriod from "~~/models/SwabPeriod";
import SwabProductHistory from "~~/models/SwabProductHistory";
import SwabTest from "~~/models/SwabTest";
import SwabTestBacteria from "~~/models/SwabTestBacteria";
import SwabTestBacteriaSpecie from "~~/models/SwabTestBacteriaSpecie";
import { Shift } from "./useDate";
import {
  LoadAllSwabProductHistoryFilter,
  useFilterSwabProductHistory,
} from "./useFilterSwabProductHistory";
import { SearchParams } from "./useRequest";

export enum BacteriaStatus {
  PENDING = "pending",
  DETECTED = "detected",
  NORMAL = "normal",
  ALL = "all",
}

export enum BacteriaStatusMapper {
  pending = "รอผล",
  detected = "พบเชื้อ",
  normal = "ปกติ",
  all = "ทั้งหมด",
}

export type BacteriaSpecieData = {
  bacteriaName?: string;
  bacteriaId?: string;
  bacteriaSpecieName?: string;
  bacteriaSpecieId?: string;
};

export interface LoadAllLabSwabAreaHistoryData {
  date: string;
  shift?: Shift;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  hasBacteria?: boolean;
}

export interface LoadAllLabSwabProductHistoryData
  extends LoadAllLabSwabAreaHistoryData {
  productId?: string;
}

export interface LoadAllLabSwabAreaHistoryResponse {
  swabAreaHistories: SwabAreaHistory[];

  swabTests: SwabTest[];

  swabAreas: SwabArea[];

  swabPeriods: SwabPeriod[];

  facilities: Facility[];

  facilityitems: FacilityItem[];
}

export interface LoadAllLabSwabProductHistoryResponse
  extends LoadAllLabSwabAreaHistoryResponse {
  swabProductHistories: SwabProductHistory[];
  products: Product[];
}

export const useLab = () => {
  const { get, put } = useRequest();
  const { today, onlyDate } = useDate();

  //   useRepo(SwabArea);
  //   useRepo(SwabPeriod);
  //   useRepo(SwabTest);
  //   useRepo(Facility);
  //   useRepo(FacilityItem);
  //   useRepo(BacteriaSpecie);
  //   useRepo(SwabTestBacteria);

  const swabAreaRepo = useRepo(SwabArea);
  const productRepo = useRepo(Product);
  const swabPeriodRepo = useRepo(SwabPeriod);
  const facilityRepo = useRepo(Facility);
  const facilityItemRepo = useRepo(FacilityItem);
  const swabAreaHistoryRepo = useRepo(SwabAreaHistory);
  const swabProductHistoryRepo = useRepo(SwabProductHistory);
  const swabTestRepo = useRepo(SwabTest);
  const bacteriaRepo = useRepo(Bacteria);
  const bacteriaSpecieRepo = useRepo(BacteriaSpecie);
  const swabTestBacteriaRepo = useRepo(SwabTestBacteria);
  const swabTestBacteriaSpecieRepo = useRepo(SwabTestBacteriaSpecie);

  const getBacteriaByIds = (ids: string[]) => {
    const query = bacteriaRepo.where("id", ids);

    return query.get();
  };

  const getBacteriaById = (id: string) => {
    const query = bacteriaRepo.where("id", id);

    return query.first();
  };

  const getBacteriaByNames = (names: string[]) => {
    return names
      .map((name) => {
        return bacteriaRepo.where("bacteriaName", name).first();
      })
      .filter(Boolean);
  };

  const getBacteriaBySwabTestId = (swabTestId: string) => {
    let bacteria = [];

    const swabTestBacteria = swabTestBacteriaRepo
      .where("swabTestId", swabTestId)
      .get();

    if (swabTestBacteria.length) {
      const bacteriaIds = [
        ...new Set(
          swabTestBacteria.map(({ bacteriaId }) => bacteriaId).filter(Boolean)
        ),
      ];

      bacteria = bacteriaRepo.find(bacteriaIds);
    }

    return bacteria;
  };

  const getBacteriaSpecieByIds = (ids: string[]) => {
    const query = bacteriaSpecieRepo.where("id", ids);

    return query.get();
  };

  const getBacteriaSpecieByBacteriaIds = (bacteriaIds: string[]) => {
    const query = bacteriaSpecieRepo.where("bacteriaId", bacteriaIds);

    return query.get();
  };

  const getBacteriaSpecieByBacteriaId = (bacteriaId: string) => {
    const query = bacteriaSpecieRepo.where("bacteriaId", bacteriaId);

    return query.get();
  };

  const getBacteriaSpecieById = (id: string) => {
    const query = bacteriaSpecieRepo.where("id", id);

    return query.first();
  };

  const getBacteriaSpecieByNames = (names: string[]) => {
    return names
      .map((name) => {
        return bacteriaSpecieRepo.where("bacteriaSpecieName", name).first();
      })
      .filter(Boolean);
  };

  const getBacteriaSpecieBySwabTestId = (swabTestId: string) => {
    let bacteriaSpecies = [];

    const swabTestBacteriaSpecies = swabTestBacteriaSpecieRepo
      .where("swabTestId", swabTestId)
      .get();

    if (swabTestBacteriaSpecies.length) {
      const bacteriaSpecieIds = [
        ...new Set(
          swabTestBacteriaSpecies
            .map(({ bacteriaSpecieId }) => bacteriaSpecieId)
            .filter(Boolean)
        ),
      ];

      bacteriaSpecies = bacteriaSpecieRepo.find(bacteriaSpecieIds);
    }

    return bacteriaSpecies;
  };

  const getSwabTestById = (id: string): SwabTest | null => {
    const query = swabTestRepo.where("id", id);

    return query.first();
  };

  const getBacteriaStateBySwabTestId = (swabTestId: string | null) => {
    let stateBacteria = null;

    if (swabTestId) {
      const swabTest = getSwabTestById(swabTestId);

      if (swabTest.swabTestRecordedAt !== null) {
        const bacteria = getBacteriaBySwabTestId(swabTestId);

        stateBacteria = bacteria.length > 0;
      }
    }

    return stateBacteria;
  };

  const loadBacteriaToSwabTest = (swabTests: SwabTest[]): SwabTest[] => {
    swabTestRepo.with("bacteria").load(swabTests);

    return swabTests;
  };

  const loadAllBacteria = async (): Promise<Bacteria[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<Bacteria[]>("/bacteria");

      watch(data, (bacteriaData) => {
        const bacterias = bacteriaRepo.save(bacteriaData);

        resolve(bacterias);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load bacteria failed");
      });
    });
  };

  const loadAllBacteriaWithSpecie = async (): Promise<Bacteria[]> => {
    return new Promise((resolve, reject) => {
      const params: SearchParams = {
        bacteriaSpecies: true,
      };

      const { data, error } = get<Bacteria[]>("/bacteria", {
        params,
      });

      watch(data, (bacteriaData) => {
        const bacterias = bacteriaRepo.save(bacteriaData);

        resolve(bacterias);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load bacteria failed");
      });
    });
  };

  const loadAllBacteriaSpecies = async (): Promise<BacteriaSpecie[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<BacteriaSpecie[]>("/bacteria-specie");

      watch(data, (bacteriaSpecieData) => {
        const bacteriaSpecies = bacteriaSpecieRepo.save(bacteriaSpecieData);

        resolve(bacteriaSpecies);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load bacteria species failed");
      });
    });
  };

  const mapPivotSwabTestBacteria = (swabTest) => {
    if (swabTest.bacteria?.length) {
      swabTest.bacteria = swabTest.bacteria.map((bacteria) => ({
        ...bacteria,
        pivot: {
          bacteriaId: bacteria.id,
          swabTestId: swabTest.id,
        },
      }));
    }

    return swabTest;
  };

  const mapPivotSwabTestBacteriaSpecie = (swabTest) => {
    if (swabTest.bacteriaSpecies?.length) {
      const bacteriaSpecies = [];

      swabTest.bacteriaSpecies.forEach((bacteriaSpecie) => {
        if (bacteriaSpecie.id) {
          bacteriaSpecies.push({
            ...bacteriaSpecie,
            pivot: {
              bacteriaSpecieId: bacteriaSpecie.id,
              swabTestId: swabTest.id,
            },
          });
        }
      });

      swabTest.bacteriaSpecies = bacteriaSpecies;
    }

    return swabTest;
  };

  const saveBacteriaRelationBySwabTestId = (
    swabTestId: string,
    bacteriaSpecies: BacteriaSpecieData[]
  ) => {
    const insertedSwabTestBacteria = bacteriaSpecies.map(({ bacteriaId }) => ({
      bacteriaId,
      swabTestId,
    }));

    swabTestBacteriaRepo.insert(insertedSwabTestBacteria);
  };

  const saveBacteriaSpecieRelationBySwabTestId = (
    swabTestId: string,
    bacteriaSpecies: BacteriaSpecieData[]
  ) => {
    const insertedSwabTestBacteria = [];

    bacteriaSpecies.forEach(({ bacteriaSpecieId }) => {
      if (bacteriaSpecieId) {
        insertedSwabTestBacteria.push({
          bacteriaSpecieId,
          swabTestId,
        });
      }
    });

    if (insertedSwabTestBacteria.length) {
      swabTestBacteriaSpecieRepo.insert(insertedSwabTestBacteria);
    }
  };

  const clearBacteriaRelationBySwabTestId = (swabTestId: string): void => {
    swabTestBacteriaRepo.where("swabTestId", swabTestId).delete();
  };

  const clearBacteriaSpecieRelationBySwabTestId = (
    swabTestId: string
  ): void => {
    swabTestBacteriaSpecieRepo.where("swabTestId", swabTestId).delete();
  };

  const saveRelatedLoadAllLabSwabAreaHistoryResponse = (
    response: LoadAllLabSwabAreaHistoryResponse
  ): void => {
    const {
      swabTests = [],
      swabAreas = [],
      swabPeriods = [],
      facilities = [],
      facilityitems = [],
    } = response;

    if (swabTests.length) {
      swabTests.map((swabTest) => {
        clearBacteriaRelationBySwabTestId(swabTest.id);

        clearBacteriaSpecieRelationBySwabTestId(swabTest.id);

        swabTest = mapPivotSwabTestBacteria(swabTest);

        swabTest = mapPivotSwabTestBacteriaSpecie(swabTest);

        return swabTest;
      });

      swabTestRepo.save(swabTests);
    }

    if (swabAreas.length) {
      swabAreaRepo.save(swabAreas);
    }

    if (swabPeriods.length) {
      swabPeriodRepo.save(swabPeriods);
    }

    if (facilities.length) {
      facilityRepo.save(facilities);
    }

    if (facilityitems.length) {
      facilityItemRepo.save(facilityitems);
    }
  };

  const transformLoadAllLabSwabAreaHistoryData = (
    loadAllLabSwabAreaHistoryData: LoadAllLabSwabAreaHistoryData
  ): SearchParams => {
    const {
      date,
      shift,
      facilityId,
      facilityItemId,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      hasBacteria,
    } = loadAllLabSwabAreaHistoryData;

    const params: any = {
      swabAreaDate: onlyDate(new Date(date)),
    };

    if (shift && shift !== Shift.ALL) {
      params.shift = shift;
    }

    if (facilityId) {
      params.facilityId = facilityId;
    }

    if (facilityItemId) {
      params.facilityItemId = facilityItemId;
    }

    if (mainSwabAreaId) {
      params.swabAreaId = mainSwabAreaId;
    }

    if (swabPeriodId) {
      params.swabPeriodId = swabPeriodId;
    }

    if (swabTestCode) {
      params.swabTestCode = swabTestCode;
    }

    if (hasBacteria) {
      params.hasBacteria = true;
    }

    return params;
  };

  const loadAllLabSwabAreaHistory = async (
    loadAllLabSwabAreaHistoryData: LoadAllLabSwabAreaHistoryData
  ): Promise<SwabAreaHistory[]> => {
    return new Promise((resolve, reject) => {
      const params = transformLoadAllLabSwabAreaHistoryData(
        loadAllLabSwabAreaHistoryData
      );

      const { data, error } = get<LoadAllLabSwabAreaHistoryResponse>(
        "/swab/area-history/lab",
        {
          params,
        }
      );

      watch(data, (response) => {
        const { swabAreaHistories = [] } = response;

        saveRelatedLoadAllLabSwabAreaHistoryResponse(response);

        const updatedSwabAreaHistoryData =
          swabAreaHistoryRepo.save(swabAreaHistories);

        resolve(updatedSwabAreaHistoryData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("load all lab swab area history failed");
      });
    });
  };

  const saveRelatedLoadAllLabSwabProductHistoryResponse = (
    response: LoadAllLabSwabProductHistoryResponse
  ): void => {
    saveRelatedLoadAllLabSwabAreaHistoryResponse(response);

    const { products = [] } = response;

    if (products.length) {
      productRepo.save(products);
    }
  };

  const loadAllLabSwabProductHistory = async (
    filter: LoadAllSwabProductHistoryFilter
  ): Promise<SwabProductHistory[]> => {
    return new Promise((resolve, reject) => {
      const { toDto } = useFilterSwabProductHistory();

      const params: SearchParams = toDto(filter);

      const { data, error } = get<LoadAllLabSwabProductHistoryResponse>(
        "/swab/product-history/lab",
        {
          params,
        }
      );

      watch(data, (response) => {
        saveRelatedLoadAllLabSwabProductHistoryResponse(response);

        const { swabProductHistories = [] } = response;

        const updatedSwabProductHistoryData =
          swabProductHistoryRepo.save(swabProductHistories);

        resolve(updatedSwabProductHistoryData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("load all lab swab product history failed");
      });
    });
  };

  const updateSwabTestById = (
    swabTestId: string,
    bacteriaSpecies: BacteriaSpecieData[]
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const swabTestRecordedAt = today().toISOString();

      const { data, error } = put<any>(`/swab-test/${swabTestId}`, {
        swabTestRecordedAt,
        bacteriaSpecies,
      });

      watch(data, (responseData) => {
        swabTestRepo.save({ id: swabTestId, swabTestRecordedAt });

        if (!bacteriaSpecies.length) {
          clearBacteriaRelationBySwabTestId(swabTestId);
          clearBacteriaSpecieRelationBySwabTestId(swabTestId);
        } else {
          saveBacteriaRelationBySwabTestId(swabTestId, bacteriaSpecies);
          saveBacteriaSpecieRelationBySwabTestId(swabTestId, bacteriaSpecies);
        }

        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update swab test by id failed");
      });
    });
  };

  const updateSwabTestBacteriaSpecies = (
    swabTestId: string,
    bacteriaSpecies: BacteriaSpecieData[]
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const bacteriaSpecieRecordedAt = today().toISOString();

      const { data, error } = put<any>(
        `/swab-test/${swabTestId}/bacteria-specie`,
        {
          bacteriaSpecieRecordedAt,
          bacteriaSpecies: bacteriaSpecies.map(
            ({ bacteriaSpecieId }) => bacteriaSpecieId
          ),
        }
      );

      watch(data, (responseData) => {
        swabTestRepo.save({ id: swabTestId, bacteriaSpecieRecordedAt });

        clearBacteriaSpecieRelationBySwabTestId(swabTestId);

        saveBacteriaSpecieRelationBySwabTestId(swabTestId, bacteriaSpecies);

        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update swab test bacteria species failed");
      });
    });
  };

  return {
    getBacteriaByIds,
    getBacteriaById,
    getBacteriaByNames,
    getBacteriaBySwabTestId,
    getBacteriaSpecieByIds,
    getBacteriaSpecieByBacteriaIds,
    getBacteriaSpecieByBacteriaId,
    getBacteriaSpecieById,
    getBacteriaSpecieByNames,
    getBacteriaSpecieBySwabTestId,
    getSwabTestById,
    getBacteriaStateBySwabTestId,
    loadBacteriaToSwabTest,
    saveBacteriaRelationBySwabTestId,
    saveBacteriaSpecieRelationBySwabTestId,
    clearBacteriaRelationBySwabTestId,
    clearBacteriaSpecieRelationBySwabTestId,
    api() {
      return {
        loadAllBacteria,
        loadAllBacteriaWithSpecie,
        loadAllBacteriaSpecies,
        loadAllLabSwabAreaHistory,
        loadAllLabSwabProductHistory,
        updateSwabTestById,
        updateSwabTestBacteriaSpecies,
      };
    },
  };
};
