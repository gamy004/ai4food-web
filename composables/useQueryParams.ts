export const useQueryParams = () => {
  const router = useRouter();
  const route = useRoute();

  const updateQueryParams = (query) => {
    // console.log({ path: route.path, query });

    router.replace({ path: route.path, query });
  };

  const getCurrentQuery = () => route.query;

  const getCurrentParams = () => route.params;

  return {
    updateQueryParams,
    getCurrentQuery,
    getCurrentParams,
  };
};
