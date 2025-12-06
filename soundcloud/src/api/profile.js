import axios from "axios";
import { readAccessToken } from "../utils/authFlag";

const client = axios.create({
  baseURL: "http://localhost:5120",
  timeout: 10000
});

export const fetchProfile = async () => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await client.get("/profile/me", { headers });
  return response.data;
};

export const completeProfile = async (payload) => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  await client.post("/profile/complete", payload, { headers });
};
