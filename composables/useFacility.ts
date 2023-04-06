import { useRepo } from "pinia-orm";
import Facility from "~~/models/Facility";
import FacilityItem from "~~/models/FacilityItem";
import Room from "~~/models/Room";

export interface ParamLoadAllFacilityItem {
  facilityId?: string;
}

export const useFacility = () => {
  const { get } = useRequest();
  const facilityRepo = useRepo(Facility);
  const facilityItemRepo = useRepo(FacilityItem);
  const roomRepo = useRepo(Room);

  const loadAllFacility = async (): Promise<Facility[]> => {
    const data = await get<Facility[]>("/facility");

    const facilities = facilityRepo.save(data);

    return facilities;
  };

  const loadAllSwabFacility = async (): Promise<Facility[]> => {
    const data = await get<Facility[]>("/facility/swab-item");

    const facilities = facilityRepo.save(data);

    return facilities;
  };

  const loadAllFacilityItem = async (
    facilityId?: string
  ): Promise<FacilityItem[]> => {
    const params: ParamLoadAllFacilityItem = {};

    if (facilityId) {
      params.facilityId = facilityId;
    }

    const data = await get<FacilityItem[]>(`/facility/item`, { params });

    const facilityItems = facilityItemRepo.save(data);

    return facilityItems;
  };

  const loadAllRoom = async (): Promise<Room[]> => {
    const data = await get<Room[]>("/room");

    const rooms = roomRepo.save(data);

    return rooms;
  };

  const getFacilityByIds = (ids: string[]): Facility[] => {
    const query = facilityRepo.where("id", ids);

    return query
      .orderBy("facilityType", "asc")
      .orderBy("facilityName", "asc")
      .get();
  };

  const getFacilityById = (id: string): Facility | null => {
    return facilityRepo.find(id);
  };

  const getFacilityByName = (name: string): Facility | null => {
    const query = facilityRepo.where("facilityName", name);

    return query.first();
  };

  const getFacilityItemByIds = (ids: string[], filters: any = {}) => {
    const query = facilityItemRepo.where("id", ids);

    if (filters.facilityId) {
      query.where("facilityId", filters.facilityId);
    }

    return query.orderBy("facilityItemName", "asc").get();
  };

  const getFacilityItemById = (id: string) => {
    return facilityItemRepo.find(id);
  };

  const getRoomByName = (name: string): Room | null => {
    const query = roomRepo.where("roomName", name);
    console.debug("getRoomByName: ", name);

    return query.first();
  };

  return {
    getFacilityByIds,

    getFacilityById,

    getFacilityByName,

    getFacilityItemByIds,

    getFacilityItemById,

    getRoomByName,

    api() {
      return {
        loadAllFacility,
        loadAllSwabFacility,
        loadAllFacilityItem,
        loadAllRoom,
      };
    },
  };
};
