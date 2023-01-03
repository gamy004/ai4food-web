import { useToast } from "vue-toastification";

const AUTH_LOGIN_PATH = "/auth/login";

const { isAuthenticated, clearAuth, api: authApi } = useAuth();

const toast = useToast();

export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    await authApi().loadProfile();
  } catch (error) {
    toast.error("session หมดเวลา กรุณาเข้าสู่ระบบใหม่อีกครั้ง");

    clearAuth();
  }

  if (!isAuthenticated.value && from.path != AUTH_LOGIN_PATH) {
    return navigateTo(AUTH_LOGIN_PATH);
  }
});
