import { useRepo } from "pinia-orm";
import Bacteria from "~~/models/Bacteria";

export const useBacteria = () => {
  const { get, post, put, destroy } = useRequest();

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
    return new Promise((resolve, reject) => {
      const { data, error } = get<Bacteria[]>("/bacteria");

      watch(data, (BacteriaData) => {
        const Bacterias = bacteriaRepo.save(BacteriaData);

        resolve(Bacterias);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load swab test failed");
      });
    });
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
