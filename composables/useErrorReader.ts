export const useErrorReader = () => {
  const errorState = reactive({
    statusCode: null,
    messages: [],
    error: ""
  });

  const readErrorResponse = (errorResponse) => {

  };

  return {
    readErrorResponse
  };
};
