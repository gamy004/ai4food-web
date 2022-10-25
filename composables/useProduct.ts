import { useRepo } from "pinia-orm";
import Product from "~~/models/Product";

export type createProductInterface = (
  body: BodyManageProduct
) => Promise<Product>;

export type updateProductInterface = (
  id: string,
  body: BodyManageProduct
) => Promise<Product>;

export type BodyManageProduct = {
  productName: string;
  productCode: string;
  alternateProductCode: string;
};

export type BodyProductSchedule = {
  importTransaction: {
    id: string
  },
  records: [
    {
      productScheduleAmount: number,
      productScheduleDate: string,
      productScheduleStartedAt: string,
      productScheduleEndedAt: string,
      product: {
        id: string
      }
    }
  ]
}

export type ResponseDeletePermission = {
  canDelete: boolean;
  message: string;
  countSwabAreaHistories: number;
  countSwabProductHistories: number;
  countProductSchedules: number;
};

export type deleteProductInterface = (id: string) => Promise<Product>;

export const useProduct = () => {
  const { get, post, put, destroy } = useRequest();
  const productRepo = useRepo(Product);

  const getProductByIds = (ids: string[]): Product[] => {
    const query = productRepo.where("id", ids);

    return query.orderBy("productCode", "asc").get();
  };

  const getProductById = (id: string): Product => {
    const query = productRepo.where("id", id);

    return query.first();
  };

  
  const getProductByCodes = (codes: string[]): Product[] => {
    const query = productRepo.where("productCode", codes);

    return query.orderBy("productCode", "asc").get();
  };

  const getProductByCode = (code: string): Product => {
    const query = productRepo.where("productCode", code);

    return query.first();
  };


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

  const loadDeletePermissionProduct = async (
    id: string
  ): Promise<ResponseDeletePermission> => {
    return new Promise((resolve, reject) => {
      const { data, error } = get<ResponseDeletePermission>(
        `/product/${id}/delete-permission`
      );

      watch(data, resolve);

      watch(error, reject);
    });
  };

  const createProduct: createProductInterface = async (
    body: BodyManageProduct
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<Product>(`/product`, body);

      watch(data, (productData) => {
        const product = productRepo.save(productData);

        resolve(product);
      });

      watch(error, reject);
    });
  };

  const updateProduct: updateProductInterface = async (
    id: string,
    body: BodyManageProduct
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<Product>(`/product/${id}`, body);

      watch(data, (productData) => {
        const product = productRepo.save(productData);

        resolve(product);
      });

      watch(error, reject);
    });
  };

  const deleteProduct: deleteProductInterface = async (
    id: string
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      const { data, error } = destroy<Product>(`/product/${id}`);

      watch(data, (productData) => {
        const productId: string = productData.id;

        const product = productRepo.destroy(productId);

        resolve(product);
      });

      watch(error, reject);
    });
  };

  const createProductSchedule = async (body: BodyProductSchedule): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/product-schedule/import`, body);

      watch(data, resolve);

      watch(error, reject);
    });
  };

  return {
    getProductByIds,

    getProductById,

    getProductByCodes,

    getProductByCode,
    api() {
      return {
        loadAllProduct,
        loadDeletePermissionProduct,
        updateProduct,
        createProduct,
        deleteProduct,
        createProductSchedule
      };
    },
  };
};
