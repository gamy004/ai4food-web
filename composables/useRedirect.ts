export const useRedirect = () => {
  const route = useRoute();
  const router = useRouter();

  const redirect = (): void => {
    const { redirect } = route.query;
    const { fallBackRedirect } = route.meta;

    if (redirect) {
      router.push(redirect as string);
    } else if (fallBackRedirect) {
      router.push(fallBackRedirect as string);
    } else {
      router.back();
    }
  };

  return {
    redirect
  };
};
