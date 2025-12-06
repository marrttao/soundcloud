export const AUTH_STORAGE_KEY = "sc:account-authenticated";

export const readAuthFlag = () =>
  typeof window !== "undefined" &&
  window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";

export const setAuthFlag = (value = true) =>
  typeof window !== "undefined" &&
  window.localStorage.setItem(AUTH_STORAGE_KEY, value ? "true" : "false");

export const ACCESS_TOKEN_KEY = "sc:access-token";
export const REFRESH_TOKEN_KEY = "sc:refresh-token";

export const storeAuthTokens = (accessToken, refreshToken) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const readAccessToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
