import { useRepo } from "pinia-orm";
import Bacteria from "~~/models/Bacteria";

export const useBacteria = () => {
  const { get } = useRequest();

  const bacteriaRepo = useRepo(Bacteria);

  const getBacterias = (): Bacteria[] => {
    const query = bacteriaRepo;

    return query.orderBy("id", "asc").get();
  };

  const getBacteriaByIds = (ids: string[]): Bacteria[] => {
    const query = bacteriaRepo.where("id", ids);

    return query.orderBy("id", "asc").get();
  };

  const loadAllBacteria = async (): Promise<Bacteria[]> => {
    const data = await get<Bacteria[]>("/bacteria");

    const bacterias = bacteriaRepo.save(data);

    return bacterias;
  };

  return {
    getBacterias,
    getBacteriaByIds,
    api() {
      return {
        loadAllBacteria,
      };
    },
  };
};
