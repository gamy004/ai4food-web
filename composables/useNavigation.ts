import { RouteLocationRaw, NavigationFailure } from "vue-router";

export const useNavigation = () => {
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

  const isPage = (pageName: string): boolean => {
    return route.name === pageName;
  };

  const goTo = (
    options: RouteLocationRaw
  ): Promise<void | NavigationFailure> => {
    return router.push(options);
  };

  return {
    redirect,
    goTo,
    isPage,
  };
};
