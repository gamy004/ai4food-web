const AUTH_LOGIN_PATH = "/auth/login";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, api: authApi } = useAuth();

  if (!isAuthenticated.value && from.path != AUTH_LOGIN_PATH) {
    return navigateTo(AUTH_LOGIN_PATH);
  }

  await authApi().loadProfile();
});
