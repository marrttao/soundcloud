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

export const fetchFeed = async () => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await client.get("/feed", { headers });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};
