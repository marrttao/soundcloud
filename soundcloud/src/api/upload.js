import axios from "axios";
import { readAccessToken } from "../utils/authFlag";

const client = axios.create({
  baseURL: "http://localhost:5120",
  timeout: 60000
});

const extractMessage = (error) => {
  if (error?.response?.data) {
    if (typeof error.response.data === "string") {
      return error.response.data;
    }
    if (typeof error.response.data?.error === "string") {
      return error.response.data.error;
    }
  }
  return error?.message ?? "Upload failed";
};

export const uploadTrack = async ({ file, title, coverFile, coverUrl, description, isPrivate, durationSeconds }) => {
  const token = readAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  if (!file) {
    throw new Error("Audio file is required");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (title) {
    formData.append("title", title);
  }
  if (coverFile) {
    formData.append("coverFile", coverFile);
  } else if (coverUrl) {
    formData.append("coverUrl", coverUrl);
  }
  if (description) {
    formData.append("description", description);
  }
  if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds > 0) {
    formData.append("durationSeconds", String(durationSeconds));
  }
  if (typeof isPrivate === "boolean") {
    formData.append("isPrivate", isPrivate ? "true" : "false");
  }

  try {
    const response = await client.post("/tracks/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
};
