export default defineNuxtRouteMiddleware((to, from) => {
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  if (isAuthenticated.value) {
    return router.push("/");
  }
});
