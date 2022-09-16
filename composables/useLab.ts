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
import { Shift } from "./useDate";
import {
  LoadAllSwabProductHistoryFilter,
  useFilterSwabProductHistory,
} from "./useFilterSwabProductHistory";
import { SearchParams } from "./useRequest";

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
  const swabTestBacteriaRepo = useRepo(SwabTestBacteria);

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
    const query = swabTestBacteriaRepo.where("swabTestId", swabTestId);

    return query.get();
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

        reject("Load swab periods failed");
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

  const clearBacteriaRelationBySwabTestId = (swabTestId: string): void => {
    swabTestBacteriaRepo.where("swabTestId", swabTestId).delete();
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

        return mapPivotSwabTestBacteria(swabTest);
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
        } else {
          saveBacteriaRelationBySwabTestId(swabTestId, bacteriaSpecies);
        }

        resolve(responseData);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update swab test by id failed");
      });
    });
  };

  return {
    getBacteriaByIds,
    getBacteriaById,
    getBacteriaByNames,
    getBacteriaBySwabTestId,
    getSwabTestById,
    getBacteriaStateBySwabTestId,
    loadBacteriaToSwabTest,
    saveBacteriaRelationBySwabTestId,
    clearBacteriaRelationBySwabTestId,
    api() {
      return {
        loadAllBacteria,
        loadAllLabSwabAreaHistory,
        loadAllLabSwabProductHistory,
        updateSwabTestById,
      };
    },
  };
};
