import type { User } from "../types/api";
import { ApiError, request } from "./http-client";

const userKey = "redflags.userEmail";
const accessKey = "redflags.accessToken";
const refreshKey = "redflags.refreshToken";
const roleKey = "redflags.userRole";

type LoginResponse = User & {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: User;
};
type RefreshResponse = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
};

function access(response: RefreshResponse) {
  return response.accessToken ?? response.access_token;
}
function refresh(response: RefreshResponse) {
  return response.refreshToken ?? response.refresh_token;
}

export const authSession = {
  saveLogin(response: LoginResponse) {
    const user = response.user ?? response;
    localStorage.setItem(userKey, user.email);
    if (user.role) localStorage.setItem(roleKey, user.role);
    else localStorage.removeItem(roleKey);
    const token = access(response),
      renewal = refresh(response);
    if (token) localStorage.setItem(accessKey, token);
    if (renewal) localStorage.setItem(refreshKey, renewal);
  },
  clear() {
    localStorage.removeItem(userKey);
    localStorage.removeItem(accessKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(roleKey);
  },
  isAuthenticated() {
    return Boolean(
      localStorage.getItem(accessKey) || localStorage.getItem(userKey),
    );
  },
  getAccessToken() {
    return localStorage.getItem(accessKey);
  },
  getEmail() {
    return localStorage.getItem(userKey);
  },
  getRole() {
    return localStorage.getItem(roleKey);
  },
  isAdmin() {
    return this.getRole() === "admin";
  },
  async refreshIfAvailable() {
    const token = localStorage.getItem(refreshKey);
    if (!token) return true;
    try {
      const result = await request<RefreshResponse>("/auth/refresh", {
        method: "POST",
        body: { refreshToken: token },
      });
      const next = access(result),
        nextRefresh = refresh(result);
      if (!next) {
        this.clear();
        return false;
      }
      localStorage.setItem(accessKey, next);
      if (nextRefresh) localStorage.setItem(refreshKey, nextRefresh);
      return true;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        this.clear();
        return false;
      }
      return this.isAuthenticated();
    }
  },
};
