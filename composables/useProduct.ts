import { Item, useRepo } from "pinia-orm";
import Product from "~~/models/Product";
import ProductSchedule from "~~/models/ProductSchedule";
import { Shift } from "./useDate";
import { SearchParams } from "./useRequest";

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

export type deleteProductInterface = (id: string) => Promise<Item<Product>>;

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

  const getProductById = (id: string): Item<Product> => {
    return productRepo.find(id);
  };

  const getProductByCodes = (codes: string[]): Product[] => {
    const query = productRepo.where("productCode", codes);

    return query.orderBy("productCode", "asc").get();
  };

  const getProductByCode = (code: string): Item<Product> => {
    const query = productRepo.where("productCode", code);

    return query.first();
  };

  const getProductScheduleByIds = (ids: string[]): ProductSchedule[] => {
    const query = productScheduleRepo.where("id", ids);

    return query.get();
  };

  const getProductScheduleById = (id: string): Item<ProductSchedule> => {
    return productScheduleRepo.find(id);
  };

  const loadAllProduct = async (): Promise<Product[]> => {
    const data = await get<Product[]>("/product");

    const products = productRepo.save(data);

    return products;
  };

  const loadDeletePermissionProduct = async (
    id: string
  ): Promise<ResponseDeletePermission> => {
    const data = await get<ResponseDeletePermission>(
      `/product/${id}/delete-permission`
    );

    return data;
  };

  const createProduct: createProductInterface = async (
    body: BodyManageProduct
  ): Promise<Product> => {
    const data = await post<Product>(`/product`, body);

    const product = productRepo.save(data);

    return product;
  };

  const updateProduct: updateProductInterface = async (
    id: string,
    body: BodyManageProduct
  ): Promise<Product> => {
    const data = await put<Product>(`/product/${id}`, body);

    const product = productRepo.save(data);

    return product;
  };

  const deleteProduct: deleteProductInterface = async (
    id: string
  ): Promise<Item<Product>> => {
    const data = await destroy<Product>(`/product/${id}`);

    const productId: string = data.id;

    const product = productRepo.destroy(productId);

    return product;
  };

  const loadProductSchedule = async (
    filter: LoadProductScheduleParams
  ): Promise<ProductSchedule[]> => {
    const params: SearchParams = {};

    if (filter.fromDate) {
      params.fromDate = filter.fromDate;
    }

    if (filter.toDate) {
      params.toDate = filter.toDate;
    }

    const data = await get<LoadProductScheduleData>("/product-schedule", {
      params,
    });

    const { productSchedules: insertedProductSchedules = [] } = data;

    const productSchedules = productScheduleRepo.save(insertedProductSchedules);

    return productSchedules;
  };

  const importProductSchedule = async (
    body: BodyImportProductSchedule
  ): Promise<any> => {
    const data = await post<any>(`/product-schedule/import`, {
      ...body,
      timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
    });

    return data;
  };

  const updateProductSchedule = async (
    id: string,
    body: UpdateProductScheduleData
  ): Promise<ProductSchedule> => {
    const data = await put<ProductSchedule>(`/product-schedule/${id}`, {
      ...body,
      timezone: "Asia/Bangkok", // force sent timezone as "Asia/Bangkok"
    });

    const productSchedule = productScheduleRepo.save(data);

    return productSchedule;
  };

  const deleteProductSchedule = async (
    id: string
  ): Promise<Item<ProductSchedule>> => {
    await destroy<ProductSchedule>(`/product-schedule/${id}`);

    const productSchedule = productScheduleRepo.destroy(id);

    return productSchedule;
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
