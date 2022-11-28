import { useRepo } from "pinia-orm";
import Product from "~~/models/Product";
import ProductSchedule from "~~/models/ProductSchedule";
import { Shift } from "./useDate";

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

export type ConnectImportTransaction = {
  id: string;
};

export type ConnectProduct = {
  id: string;
};

export type UpdateProductScheduleData = {
  productScheduleAmount: number;
  productScheduleDate: string;
  productScheduleStartedAt: string;
  productScheduleEndedAt: string;
  product: ConnectProduct;
  timezone?: string;
};

export type ImportProductScheduleData = {
  productScheduleAmount: number;
  productScheduleDate: string;
  productScheduleStartedAt: string;
  productScheduleEndedAt: string;
  product: ConnectProduct;
  shift: Shift;
};

export type BodyImportProductSchedule = {
  importTransaction: ConnectImportTransaction;
  records: ImportProductScheduleData[];
  timezone?: string;
};

export type ResponseDeletePermission = {
  canDelete: boolean;
  message: string;
  countSwabAreaHistories: number;
  countSwabProductHistories: number;
  countProductSchedules: number;
};

export type deleteProductInterface = (id: string) => Promise<Product>;

export type LoadProductScheduleParams = {
  fromDate: string;
  toDate: string;
};

export type LoadProductScheduleData = {
  productSchedules: ProductSchedule[];
};

export const useProduct = () => {
  const { get, post, put, destroy } = useRequest();
  const productRepo = useRepo(Product);
  const productScheduleRepo = useRepo(ProductSchedule);

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

  const getProductScheduleByIds = (ids: string[]): ProductSchedule[] => {
    const query = productScheduleRepo.where("id", ids);

    return query.get();
  };

  const getProductScheduleById = (id: string): ProductSchedule => {
    const query = productScheduleRepo.where("id", id);

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

  const loadProductSchedule = async (
    params: LoadProductScheduleParams
  ): Promise<ProductSchedule[]> => {
    return new Promise((resolve, reject) => {
      const requestParams: any = {};

      if (params.fromDate) {
        requestParams.fromDate = params.fromDate;
      }

      if (params.toDate) {
        requestParams.toDate = params.toDate;
      }

      const { data, error } = get<LoadProductScheduleData>(
        "/product-schedule",
        { params: requestParams }
      );

      watch(data, (productScheduleData) => {
        const { productSchedules: insertedProductSchedules = [] } =
          productScheduleData;

        const productSchedules = productScheduleRepo.save(
          insertedProductSchedules
        );

        resolve(productSchedules);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load product failed");
      });
    });
  };

  const importProductSchedule = async (
    body: BodyImportProductSchedule
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<any>(`/product-schedule/import`, {
        ...body,
        timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
      });

      watch(data, resolve);

      watch(error, reject);
    });
  };

  const updateProductSchedule = async (
    id: string,
    body: UpdateProductScheduleData
  ): Promise<ProductSchedule> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<ProductSchedule>(`/product-schedule/${id}`, {
        ...body,
        timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
      });

      watch(data, (productScheduleData) => {
        const productSchedule = productScheduleRepo.save(productScheduleData);

        resolve(productSchedule);
      });

      watch(error, reject);
    });
  };

  const deleteProductSchedule = async (
    id: string
  ): Promise<ProductSchedule> => {
    return new Promise((resolve, reject) => {
      const { data, error } = destroy<ProductSchedule>(
        `/product-schedule/${id}`
      );

      watch(data, () => {
        const productSchedule = productScheduleRepo.destroy(id);

        resolve(productSchedule);
      });

      watch(error, reject);
    });
  };

  return {
    getProductByIds,

    getProductById,

    getProductByCodes,

    getProductByCode,

    getProductScheduleByIds,

    getProductScheduleById,
    api() {
      return {
        loadAllProduct,
        loadDeletePermissionProduct,
        updateProduct,
        createProduct,
        deleteProduct,
        loadProductSchedule,
        importProductSchedule,
        updateProductSchedule,
        deleteProductSchedule,
      };
    },
  };
};
