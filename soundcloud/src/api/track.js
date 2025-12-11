import axios from "axios";
import { readAccessToken } from "../utils/authFlag";

const client = axios.create({
  baseURL: "http://localhost:5120",
  timeout: 15000
});

const buildAuthHeaders = () => {
  const token = readAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  return {
    Authorization: `Bearer ${token}`
  };
};

const toCamel = (value) => {
  if (Array.isArray(value)) {
    return value.map(toCamel);
  }
  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = toCamel(val);
      return acc;
    }, {});
  }
  return value;
};

export const fetchTrack = async (trackId) => {
  if (typeof trackId !== "number") {
    throw new Error("trackId must be a number");
  }
  const response = await client.get(`/tracks/${trackId}`, {
    headers: buildAuthHeaders()
  });
  const data = toCamel(response.data ?? {});
  const track = data.track ?? {};
  const artist = data.artist ?? {};
  return {
    id: track.id,
    title: track.title ?? "",
    description: track.description ?? null,
    audioUrl: track.audioUrl ?? track.audio_url ?? "",
    coverUrl: track.coverUrl ?? track.cover_url ?? null,
    waveformData: track.waveformData ?? null,
    durationSeconds: track.durationSeconds ?? null,
    playsCount: track.playsCount ?? 0,
    likesCount: track.likesCount ?? 0,
    isPrivate: track.isPrivate ?? false,
    createdAt: track.createdAt ?? null,
    uploadedAt: track.uploadedAt ?? null,
    artist: {
      id: artist.id,
      username: artist.username ?? "",
      fullName: artist.fullName ?? null,
      avatarUrl: artist.avatarUrl ?? null
    },
    isLiked: Boolean(data.isLiked),
    isFollowing: Boolean(data.isFollowing)
  };
};

export const likeTrack = async (trackId) => {
  if (typeof trackId !== "number") {
    throw new Error("trackId must be a number");
  }
  await client.post(`/tracks/${trackId}/like`, null, {
    headers: buildAuthHeaders()
  });
};

export const unlikeTrack = async (trackId) => {
  if (typeof trackId !== "number") {
    throw new Error("trackId must be a number");
  }
  await client.delete(`/tracks/${trackId}/like`, {
    headers: buildAuthHeaders()
  });
};


export const followArtist = async (artistId) => {
  if (!artistId) {
    throw new Error("artistId must be provided");
  }
  await client.post(`/profiles/${artistId}/follow`, null, {
    headers: buildAuthHeaders()
  });
};

export const unfollowArtist = async (artistId) => {
  if (!artistId) {
    throw new Error("artistId must be provided");
  }
  await client.delete(`/profiles/${artistId}/follow`, {
    headers: buildAuthHeaders()
  });
};

export const markTrackPlayed = async (trackId) => {
  if (typeof trackId !== "number" || Number.isNaN(trackId)) {
    return;
  }
  try {
    await client.post(`/tracks/${trackId}/listen`, null, {
      headers: buildAuthHeaders()
    });
  } catch (error) {
    if (error?.response?.status === 401) {
      throw error;
    }
    console.warn("Failed to record listening history", error);
  }
};
