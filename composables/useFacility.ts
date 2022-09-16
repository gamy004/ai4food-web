import { useRepo } from "pinia-orm";
import Facility from "~~/models/Facility";
import FacilityItem from "~~/models/FacilityItem";

export interface ParamLoadAllFacilityItem {
  facilityId?: string;
}

export const useFacility = () => {
  const { get } = useRequest();
  const facilityRepo = useRepo(Facility);
  const facilityItemRepo = useRepo(FacilityItem);

  const loadAllFacility = async (): Promise<Facility[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<Facility[]>("/facility");

      watch(data, (facilityData) => {
        const facilities = facilityRepo.save(facilityData);

        resolve(facilities);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load facility failed");
      });
    });
  };

  const loadAllSwabFacility = async (): Promise<Facility[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<Facility[]>("/facility/swab-item");

      watch(data, (facilityData) => {
        const facilities = facilityRepo.save(facilityData);

        resolve(facilities);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab facility failed");
      });
    });
  };

  const loadAllFacilityItem = async (facilityId: string = null): Promise<FacilityItem[]> => {
    return new Promise((resolve, reject) => {
      const params: ParamLoadAllFacilityItem = {};

      if (facilityId) {
        params.facilityId = facilityId;
      }

      const { data, error } = get<FacilityItem[]>(`/facility/item`, { params });

      watch(data, (facilityItemData) => {
        const facilityItems = facilityItemRepo.save(facilityItemData);

        resolve(facilityItems);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load facility item failed");
      });
    });
  };

  const getFacilityByIds = (ids: string[]): Facility[] => {
    const query = facilityRepo.where("id", ids);

    return query.orderBy("facilityType", "asc").orderBy("facilityName", "asc").get();
  };

  const getFacilityById = (id: string): Facility => {
    const query = facilityRepo.where("id", id);

    return query.first();
  };

  const getFacilityItemByIds = (ids: string[]) => {
    const query = facilityItemRepo.where("id", ids);

    return query.orderBy("facilityItemName", "asc").get();
  };

  const getFacilityItemById = (id: string) => {
    const query = facilityItemRepo.where("id", id);

    return query.first();
  };

  return {
    getFacilityByIds,

    getFacilityById,

    getFacilityItemByIds,

    getFacilityItemById,

    api() {
      return {
        loadAllFacility,
        loadAllSwabFacility,
        loadAllFacilityItem
      };
    }
  };
};
