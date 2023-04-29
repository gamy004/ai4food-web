import { useRepo } from "pinia-orm";
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
import { LoadAllSwabAreaHistoryFilter } from "./useFilterSwabAreaHistory";
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

// export interface LoadAllLabSwabAreaHistoryData {
//   date?: string;
//   dateRange?: DateRangeInterface;
//   shift?: Shift;
//   facilityId?: string;
//   facilityItemId?: string;
//   mainSwabAreaId?: string;
//   swabPeriodId?: string;
//   swabTestCode?: string;
//   hasBacteria?: boolean;
//   skip?: number;
//   take?: number;
// }

export interface LoadAllLabSwabProductHistoryData
  extends LoadAllSwabAreaHistoryFilter {
  productId?: string;
}

export interface LoadAllLabSwabAreaHistoryResponse {
  swabAreaHistories: SwabAreaHistory[];

  swabTests: SwabTest[];

  swabAreas: SwabArea[];

  swabPeriods: SwabPeriod[];

  facilities: Facility[];

  facilityitems: FacilityItem[];

  total: number;
}

export interface LoadAllLabSwabProductHistoryResponse
  extends LoadAllLabSwabAreaHistoryResponse {
  swabProductHistories: SwabProductHistory[];
  products: Product[];
}

export const useLab = () => {
  const { get, put } = useRequest();
  const { today } = useDate();

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
    return bacteriaRepo.find(id);
  };

  const getBacteriaByNames = (names: string[]) => {
    return names
      .map((name) => {
        return bacteriaRepo.where("bacteriaName", name).first();
      })
      .filter(Boolean);
  };

  const getBacteriaBySwabTestId = (swabTestId: string): Bacteria[] => {
    let bacteria: Bacteria[] = [];

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
    return bacteriaSpecieRepo.find(id);
  };

  const getBacteriaSpecieByNames = (names: string[]) => {
    return names
      .map((name) => {
        return bacteriaSpecieRepo.where("bacteriaSpecieName", name).first();
      })
      .filter(Boolean);
  };

  const getBacteriaSpecieBySwabTestId = (
    swabTestId: string
  ): BacteriaSpecie[] => {
    let bacteriaSpecies: BacteriaSpecie[] = [];

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
    return swabTestRepo.find(id);
  };

  const getBacteriaStateBySwabTestId = (swabTestId: string | null) => {
    let stateBacteria = null;

    if (swabTestId) {
      const swabTest = getSwabTestById(swabTestId);

      if (swabTest && swabTest.swabTestRecordedAt !== null) {
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
    const data = await get<Bacteria[]>("/bacteria");

    const bacterias = bacteriaRepo.save(data);

    return bacterias;
  };

  const loadAllBacteriaWithSpecie = async (): Promise<Bacteria[]> => {
    const params: SearchParams = {
      bacteriaSpecies: true,
    };

    const data = await get<Bacteria[]>("/bacteria", {
      params,
    });

    const bacterias = bacteriaRepo.save(data);

    return bacterias;
  };

  const loadAllBacteriaSpecies = async (): Promise<BacteriaSpecie[]> => {
    const data = await get<BacteriaSpecie[]>("/bacteria-specie");

    const bacteriaSpecies = bacteriaSpecieRepo.save(data);

    return bacteriaSpecies;
  };

  const mapPivotSwabTestBacteria = (swabTest: any) => {
    if (swabTest.bacteria?.length) {
      swabTest.bacteria = swabTest.bacteria.map((bacteria: any) => ({
        ...bacteria,
        pivot: {
          bacteriaId: bacteria.id,
          swabTestId: swabTest.id,
        },
      }));
    }

    return swabTest;
  };

  const mapPivotSwabTestBacteriaSpecie = (swabTest: any) => {
    if (swabTest.bacteriaSpecies?.length) {
      const bacteriaSpecies: any[] = [];

      swabTest.bacteriaSpecies.forEach((bacteriaSpecie: any) => {
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
    const insertedSwabTestBacteria: any[] = [];

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

  // const transformLoadAllLabSwabAreaHistoryData = (
  //   loadAllLabSwabAreaHistoryData: LoadAllLabSwabAreaHistoryData
  // ): SearchParams => {
  //   const {
  //     date,
  //     dateRange,
  //     shift,
  //     facilityId,
  //     facilityItemId,
  //     mainSwabAreaId,
  //     swabPeriodId,
  //     swabTestCode,
  //     hasBacteria,
  //     skip,
  //     take,
  //   } = loadAllLabSwabAreaHistoryData;

  //   const params: any = {};

  //   if (date) {
  //     params.swabAreaDate = onlyDate(new Date(date));
  //   }

  //   if (dateRange) {
  //     params.fromDate = onlyDate(new Date(dateRange.from));
  //     params.toDate = onlyDate(new Date(dateRange.to));
  //   }

  //   if (shift && shift !== Shift.ALL) {
  //     params.shift = shift;
  //   }

  //   if (facilityId) {
  //     params.facilityId = facilityId;
  //   }

  //   if (facilityItemId) {
  //     params.facilityItemId = facilityItemId;
  //   }

  //   if (mainSwabAreaId) {
  //     params.swabAreaId = mainSwabAreaId;
  //   }

  //   if (swabPeriodId) {
  //     params.swabPeriodId = swabPeriodId;
  //   }

  //   if (swabTestCode) {
  //     params.swabTestCode = swabTestCode;
  //   }

  //   if (hasBacteria) {
  //     params.hasBacteria = true;
  //   }

  //   if (skip !== undefined) {
  //     params.skip = skip;
  //   }
  //   if (take !== undefined) {
  //     params.take = take;
  //   }

  //   return params;
  // };

  const loadAllLabSwabAreaHistory = async (
    loadAllLabSwabAreaHistoryData: LoadAllSwabAreaHistoryFilter
  ): Promise<[SwabAreaHistory[], number]> => {
    const { toDto } = useFilterSwabAreaHistory();

    const params: SearchParams = toDto(loadAllLabSwabAreaHistoryData);

    const data = await get<LoadAllLabSwabAreaHistoryResponse>(
      "/swab/area-history/lab",
      {
        params,
      }
    );

    const { swabAreaHistories = [], total = 0 } = data;

    saveRelatedLoadAllLabSwabAreaHistoryResponse(data);

    const updatedSwabAreaHistoryData =
      swabAreaHistoryRepo.save(swabAreaHistories);

    return [updatedSwabAreaHistoryData, total];
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
  ): Promise<[SwabProductHistory[], number]> => {
    const { toDto } = useFilterSwabProductHistory();

    const params: SearchParams = toDto(filter);

    const data = await get<LoadAllLabSwabProductHistoryResponse>(
      "/swab/product-history/lab",
      {
        params,
      }
    );

    saveRelatedLoadAllLabSwabProductHistoryResponse(data);

    const { swabProductHistories = [], total = 0 } = data;

    const updatedSwabProductHistoryData =
      swabProductHistoryRepo.save(swabProductHistories);

    return [updatedSwabProductHistoryData, total];
  };

  const updateSwabTestById = async (
    swabTestId: string,
    bacteriaSpecies: BacteriaSpecieData[]
  ): Promise<any> => {
    const swabTestRecordedAt = today().toISOString();

    const data = await put<any>(`/swab-test/${swabTestId}`, {
      swabTestRecordedAt,
      bacteriaSpecies,
    });

    swabTestRepo.save({ id: swabTestId, swabTestRecordedAt });

    if (!bacteriaSpecies.length) {
      clearBacteriaRelationBySwabTestId(swabTestId);
      clearBacteriaSpecieRelationBySwabTestId(swabTestId);
    } else {
      saveBacteriaRelationBySwabTestId(swabTestId, bacteriaSpecies);
      saveBacteriaSpecieRelationBySwabTestId(swabTestId, bacteriaSpecies);
    }

    return data;
  };

  const updateSwabTestBacteriaSpecies = async (
    swabTestId: string,
    bacteriaSpecies: BacteriaSpecieData[]
  ): Promise<any> => {
    const bacteriaSpecieRecordedAt = today().toISOString();

    const data = await put<any>(`/swab-test/${swabTestId}/bacteria-specie`, {
      bacteriaSpecieRecordedAt,
      bacteriaSpecies: bacteriaSpecies.map(
        ({ bacteriaSpecieId }) => bacteriaSpecieId
      ),
    });

    swabTestRepo.save({ id: swabTestId, bacteriaSpecieRecordedAt });

    clearBacteriaSpecieRelationBySwabTestId(swabTestId);

    saveBacteriaSpecieRelationBySwabTestId(swabTestId, bacteriaSpecies);

    return data;
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
