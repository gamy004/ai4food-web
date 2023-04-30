import { useRepo } from "pinia-orm";
import Auth from "~~/models/Auth";
import User from "~~/models/User";

export interface LoginData {
  access_token: string;
}

export const useAuth = () => {
  const { get, post } = useRequest();

  const authCookie = useCookie("auth_data", {
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    decode: (value: string | null) =>
      value ? decodeURIComponent(value) : null,
    watch: "shallow",
  });

  // const { $cookies } = useNuxtApp();
  const userRepo = useRepo(User);

  function clearAuth(): void {
    authCookie.value = null;
    // $cookies.remove("auth_data", {
    //   path: "/",
    // });
  }

  function isAuthenticated() {
    const auth = getAuth();

    return auth !== null;
  }

  function getAuth(): Auth | null {
    // const authCookie = $cookies.get("auth_data", {
    //   path: "/",
    // });

    let auth = null;

    if (authCookie.value) {
      const authData = JSON.parse(authCookie.value);

      auth = new Auth();

      if (authData.accessToken) {
        auth.setAccessToken(authData.accessToken);
      }

      if (authData.userId) {
        auth.setUserId(authData.userId);

        const user = userRepo.find(authData.userId);

        if (user) {
          auth.setUser(new User(user));
        }
      }

      if (authData.user) {
        auth.setUser(new User(authData.user));
      }
    }

    return auth;
  }

  function saveAuth(authState: Auth) {
    authCookie.value = JSON.stringify(authState);

    // $cookies.set("auth_data", data, {
    //   path: "/",
    //   maxAge: 60 * 60 * 24 * 14,
    // });
  }

  async function login(username: string, password: string): Promise<void> {
    const { access_token } = await post<LoginData>("/auth/login", {
      username,
      password,
    });

    if (access_token) {
      const auth = new Auth();

      auth.setAccessToken(access_token);

      saveAuth(auth);
    }
  }

  async function loadProfile(): Promise<void> {
    const auth = getAuth();

    if (auth) {
      const data = await get<User>("/auth/profile");

      const user = userRepo.save(data);

      auth.setUserId(user.id);

      auth.setUser(user);

      saveAuth(auth);
    }
  }

  return {
    clearAuth,

    getAuth,

    authUser: computed((): User | null => {
      const auth = getAuth();

      return auth ? new User(auth.getUser()) : null;
    }),

    isAuthenticated: computed(isAuthenticated),

    api() {
      return {
        login,
        loadProfile,
      };
    },
  };
};
