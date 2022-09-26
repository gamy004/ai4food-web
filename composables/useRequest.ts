let authToken = null;

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

export const useRequest = () => {
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

    if (authToken) {
      additionalHeaders = {
        ...additionalHeaders,
        Authorization: `Bearer ${authToken}`,
      };
    }

    return {
      initialCache: false,
      baseURL,
      headers: {
        ...DEFAULT_HEADERS,
        ...additionalHeaders,
      },
    };
  }

  function serialize(obj, prefix = null) {
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
    setAuthToken(value): void {
      authToken = value;
    },

    get<T>(url: string, options: FetchOptions = {}) {
      const { params = {}, ...otherFetchOptions } = options;
      let requestUrl = url;
      const serializedParams = serialize(params);

      if (serializedParams.length) {
        requestUrl += `?${serialize(params)}`;
      }

      return useFetch<T, ResponseErrorT>(requestUrl, {
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
      return useFetch<T, ResponseErrorT>(url, {
        body,
        method: "post",
        ...getRequestOptions(),
        ...options,
      });
    },

    put<T>(url: string, body: Record<string, any>, options: FetchOptions = {}) {
      return useFetch<T, ResponseErrorT>(url, {
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
      return useFetch<T, ResponseErrorT>(url, {
        body,
        method: "patch",
        ...getRequestOptions(),
        ...options,
      });
    },

    destroy<T>(url: string, options: FetchOptions = {}) {
      return useFetch<T, ResponseErrorT>(url, {
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
  };
};
