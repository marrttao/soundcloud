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

const authHeaders = () => {
  const token = readAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMyPlaylists = async () => {
  try {
    const response = await client.get("/playlists", { headers: authHeaders() });
    return response.data ?? [];
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const createPlaylist = async (payload) => {
  const numericInitialTrackId = Number(payload?.initialTrackId);

  const requestPayload = {
    title: payload?.title,
    description: payload?.description,
    coverUrl: payload?.coverUrl,
    isPrivate: Boolean(payload?.isPrivate)
  };

  if (Number.isFinite(numericInitialTrackId) && numericInitialTrackId > 0) {
    requestPayload.initialTrackId = numericInitialTrackId;
  }

  try {
    const response = await client.post("/playlists", requestPayload, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const updatePlaylist = async (playlistId, payload) => {
  try {
    const response = await client.patch(`/playlists/${playlistId}`, payload, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const fetchPlaylistDetail = async (playlistId) => {
  try {
    const response = await client.get(`/playlists/${playlistId}`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const addTrackToPlaylist = async (playlistId, trackId) => {
  try {
    await client.post(`/playlists/${playlistId}/tracks`, { trackId }, { headers: authHeaders() });
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const removeTrackFromPlaylist = async (playlistId, trackId) => {
  try {
    await client.delete(`/playlists/${playlistId}/tracks/${trackId}`, { headers: authHeaders() });
  } catch (error) {
    handleAuthFailure(error);
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    await client.delete(`/playlists/${playlistId}`, { headers: authHeaders() });
  } catch (error) {
    handleAuthFailure(error);
  }
};

