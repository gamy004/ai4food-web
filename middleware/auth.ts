const AUTH_LOGIN_PATH = "/auth/login";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { setAuthToken } = useRequest();

  const { isAuthenticated, getAuth, api: authApi } = useAuth();

  if (!isAuthenticated.value && from.path != AUTH_LOGIN_PATH) {
    return navigateTo(AUTH_LOGIN_PATH);
  }

  const auth = getAuth();

  setAuthToken(auth.getAccessToken());

  await authApi().loadProfile();
});
