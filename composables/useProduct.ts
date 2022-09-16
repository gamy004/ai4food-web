import { useRepo } from "pinia-orm";
import Product from "~~/models/Product";

export const useProduct = () => {
  const { get } = useRequest();
  const productRepo = useRepo(Product);

  const loadAllProduct = async (): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<Product[]>("/product");

      watch(data, (productData) => {
        const products = productRepo.save(productData);

        resolve(products);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load product failed");
      });
    });
  };

  const getProductByIds = (ids: string[]): Product[] => {
    const query = productRepo.where("id", ids);

    return query.orderBy("productCode", "asc").get();
  };

  const getProductById = (id: string): Product => {
    const query = productRepo.where("id", id);

    return query.first();
  };

  return {
    getProductByIds,

    getProductById,

    api() {
      return {
        loadAllProduct
      };
    }
  };
};
