import axios from "axios";
import { readAccessToken } from "../utils/authFlag";

const client = axios.create({
  baseURL: "http://localhost:5120",
  timeout: 10000
});

export const search = async (query) => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await client.get("/search", { 
    headers,
    params: { q: query }
  });
  return response.data;
};

export const searchTracks = async (query) => {
  const token = readAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await client.get("/search", {
    headers,
    params: { q: query }
  });
  const data = response.data;
  return Array.isArray(data?.tracks) ? data.tracks : [];
};
