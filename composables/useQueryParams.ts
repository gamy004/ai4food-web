export const useQueryParams = () => {
  const router = useRouter();
  const route = useRoute();

  const updateQueryParams = (query) => {
    // const { href } = router.resolve({ path: route.path, query });

    // console.log(href);

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
