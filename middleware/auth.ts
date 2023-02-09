import { useToast } from "vue-toastification";

const AUTH_LOGIN_PATH = "/auth/login";

export default defineNuxtRouteMiddleware(async (_, from) => {
  const { isAuthenticated, clearAuth, api: authApi } = useAuth();
  const router = useRouter();
  const toast = useToast();

  try {
    await authApi().loadProfile();
  } catch (error) {
    toast.error("session หมดเวลา กรุณาเข้าสู่ระบบใหม่อีกครั้ง");

    clearAuth();
  }

  if (!isAuthenticated.value && from.path != AUTH_LOGIN_PATH) {
    return router.push(AUTH_LOGIN_PATH);
  }
});
