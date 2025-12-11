import axios from "axios";
import { readAccessToken, clearAuthTokens, setAuthFlag } from "../utils/authFlag";

const client = axios.create({
  baseURL: "http://localhost:5120",
  timeout: 10000
});

const handleAuthFailure = (error) => {
  if (error?.response?.status === 401) {
    clearAuthTokens();
    setAuthFlag(false);
    throw new Error("Session expired. Please sign in again.");
  }
  throw error;
};

export const fetchProfile = async () => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await client.get("/profile/me", { headers });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const fetchProfileByUsername = async (username) => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await client.get(`/profile/${username}`, { headers });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const completeProfile = async (payload) => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    await client.post("/profile/complete", payload, { headers });
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const checkUsernameAvailability = async (username) => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await client.get("/profile/check-username", {
      headers,
      params: { username }
    });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};
