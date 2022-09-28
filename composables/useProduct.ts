import { useRepo } from "pinia-orm";
import Product from "~~/models/Product";

export type updateProductInterface = (
  id: string,
  body: BodyUpdateProduct
) => Promise<Product>;

export type BodyUpdateProduct = {
  productName: string;
  productCode: string;
  alternateProductCode: string;
};

export type createProductInterface = (
  body: BodyUpdateProduct
) => Promise<Product>;

export type BodyCreateProduct = {
  productName: string;
  productCode: string;
  alternateProductCode: string;
};

export type deleteProductInterface = (
  id: string
) => Promise<Product>;

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

  const createProduct: createProductInterface = async (
    body: BodyUpdateProduct
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      const { data, error } = post<Product>(`/product/`, body);

      watch(data, (productData) => {
        const product = productRepo.save(productData);

        resolve(product);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Create product failed");
      });
    });
  };

  const updateProduct: updateProductInterface = async (
    id: string,
    body: BodyUpdateProduct
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      const { data, error } = put<Product>(`/product/${id}`, body);

      watch(data, (productData) => {
        const product = productRepo.save(productData);

        resolve(product);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Update product failed");
      });
    });
  };

  const deleteProduct: deleteProductInterface = async (
    id: string
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      const { data, error } = destroy<Product>(`/product/${id}`);

      watch(data, (productData) => {
        const product = productRepo.save(productData);

        resolve(product);
      });

      watch(error, (e) => {
        console.log(e);

        reject("Delete product failed");
      });
    });
  };

  return {
    getProductByIds,

    getProductById,

    api() {
      return {
        loadAllProduct,
        updateProduct,
        createProduct,
        deleteProduct
      };
    },
  };
};
