import { v4 } from "uuid";

export interface SearchParams {
  [key: string]: any;
}

export interface FetchOptions {
  body?: Record<string, any>;
  params?: SearchParams;
}

export interface ResponseErrorT {
  response: ResponseError;
}

export interface ResponseError {
  status: number;
  statusText: string;
  ok: boolean;
  _data: ResponseErrorData;
}

export interface ResponseErrorData {
  statusCode: number;
  message: string[];
  error: string;
}

// let authToken = null;

export const useRequest = () => {
  // const { $cookies } = useNuxtApp();
  const authCookie = useCookie("auth_data", {
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    decode: (value: string | null) =>
      value ? decodeURIComponent(value) : null,
    watch: "shallow",
  });
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  const DEFAULT_HEADERS: HeadersInit = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  };

  // if (authToken !== undefined) {
  //     DEFAULT_HEADERS = {
  //         ...DEFAULT_HEADERS,
  //         'Authorization': `Bearer ${authToken}`
  //     };
  // }

  // const DEFAULT_REQUEST_OPTIONS = {
  //     baseURL: baseURL.value,
  // };

  function getRequestOptions() {
    let additionalHeaders: HeadersInit = {};

    // something was wrong with local variable within composable (the value didn't update after the variable was set)
    // change to detect access token from cookie instead for now
    // const authCookie = $cookies.get("auth_data", {
    //   path: "/",
    // });

    if (authCookie.value) {
      const authData = JSON.parse(authCookie.value);

      if (authData.accessToken) {
        additionalHeaders = {
          ...additionalHeaders,
          Authorization: `Bearer ${authData.accessToken}`,
        };
      }
    }

    // if (authToken) {
    //   additionalHeaders = {
    //     ...additionalHeaders,
    //     Authorization: `Bearer ${authToken}`,
    //   };
    // }

    return {
      key: v4(),
      initialCache: false,
      baseURL,
      headers: {
        ...DEFAULT_HEADERS,
        ...additionalHeaders,
      },
    };
  }

  function serialize(obj, prefix = null): string {
    var str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
        str.push(
          v !== null && typeof v === "object"
            ? serialize(v, k)
            : encodeURIComponent(k) + "=" + encodeURIComponent(v)
        );
      }
    }
    return str.join("&");
  }

  return {
    // setAuthToken(value): void {
    //   authToken = value;

    //   console.log(authToken);
    // },

    get<T>(url: string, options: FetchOptions = {}) {
      const { params = {}, ...otherFetchOptions } = options;

      let requestUrl = url;

      const serializedParams = serialize(params);

      if (serializedParams.length) {
        requestUrl += `?${serialize(params)}`;
      }

      return $fetch<T>(requestUrl, {
        method: "get",
        ...getRequestOptions(),
        ...otherFetchOptions,
      });
    },

    post<T>(
      url: string,
      body: Record<string, any>,
      options: FetchOptions = {}
    ) {
      return $fetch<T>(url, {
        body,
        method: "post",
        ...getRequestOptions(),
        ...options,
      });
    },

    put<T>(url: string, body: Record<string, any>, options: FetchOptions = {}) {
      return $fetch<T>(url, {
        body,
        method: "put",
        ...getRequestOptions(),
        ...options,
      });
    },

    patch<T>(
      url: string,
      body: Record<string, any>,
      options: FetchOptions = {}
    ) {
      return $fetch<T>(url, {
        body,
        method: "patch",
        ...getRequestOptions(),
        ...options,
      });
    },

    destroy<T>(url: string, options: FetchOptions = {}) {
      return $fetch<T>(url, {
        method: "delete",
        ...getRequestOptions(),
        ...options,
      });
    },

    isErrorIdNotFound(error: ResponseErrorT) {
      const response = error.response;
      const statusCode = response._data.statusCode;
      const message = response._data.message;

      return statusCode === 400 && message.includes("id doesn't exists");
    },

    isErrorDataExists(error: ResponseErrorT, entity: string, field: string) {
      let isError = false;

      if (error && error.response) {
        const { response } = error;
        const statusCode = response._data.statusCode;
        const message = response._data.message;

        isError =
          statusCode === 400 &&
          message.includes(`${entity} with the same '${field}' already exist`);
      }

      return isError;
    },

    isErrorDataDuplicate(
      error: ResponseErrorT,
      entity: string,
      fields: string[]
    ) {
      let isError = false;
      console.log(error);

      if (error && error.response) {
        const { response } = error;
        const statusCode = response._data.statusCode;
        const message = response._data.message;

        console.log(
          message.includes(
            `${entity} has duplicated value by fields '${fields.join(",")}'`
          ),
          fields.join(",")
        );

        isError =
          statusCode === 400 &&
          message.includes(
            `${entity} has duplicated value by fields '${fields.join(",")}'`
          );
      }

      return isError;
    },
  };
};
