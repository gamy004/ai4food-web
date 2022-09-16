import { useRepo } from "pinia-orm";
import { Ref } from "vue";
import Auth from "~~/models/Auth";
import User from "~~/models/User";

export interface LoginData {
    access_token: string
}

export const useAuth = () => {
  const { get, post } = useRequest();
  const { $cookies } = useNuxtApp();
  const userRepo = useRepo(User);

  function clearAuth (): void {
    $cookies.remove("auth_data", {
      path: "/"
    });
  }

  function isAuthenticated () {
    const auth = getAuth();

    return auth !== null;
  }

  function getAuth (): Auth | null {
    const authCookie = $cookies.get("auth_data", {
      path: "/"
    });

    let auth = null;

    if (authCookie !== undefined) {
      const authData = JSON.parse(authCookie);

      auth = new Auth();

      if (authData.accessToken) {
        auth.setAccessToken(authData.accessToken);
      }

      if (authData.userId) {
        auth.setUserId(authData.userId);

        const user = userRepo.find(authData.userId);

        if (user) {
          auth.setUser(
            userRepo.find(authData.userId)
          );
        }
      }

      if (authData.user) {
        auth.setUser(
          userRepo.make({ ...authData.user })
        );
      }
    }

    return auth;
  }

  function saveAuth (data) {
    $cookies.set("auth_data", data, {
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });
  }

  function login (username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { data, error } = post<LoginData>(
        "/auth/login",
        { username, password }
      );

      watch(data, ({ access_token }) => {
        const auth = new Auth();

        auth.setAccessToken(access_token);

        saveAuth(auth);

        resolve();
      });

      watch(error, (e) => {
        console.log(e);

        reject("Login failed");
      });
    });
  }

  async function loadProfile (): Promise<void> {
    return new Promise((resolve, reject) => {
      const { data, error } = get<User>("/auth/profile");

      watch(data, (userData) => {
        const auth = getAuth();

        const user = userRepo.save({ ...userData });

        auth.setUserId(user.id);

        auth.setUser(user);

        saveAuth(auth);

        resolve();
      });

      watch(error, (e) => {
        console.log(e);

        reject("Load profile failed");
      });
    });
  }

  return {
    clearAuth,

    getAuth,

    authUser: computed((): User => {
      const auth = getAuth();

      return auth.getUser();
    }),

    isAuthenticated: computed(isAuthenticated),

    api () {
      return {
        login,
        loadProfile
      };
    }
  };
};
