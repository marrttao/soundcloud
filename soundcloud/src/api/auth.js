import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5120",
  timeout: 10000
});

const parseError = (error) => {
  if (error?.response) {
    return typeof error.response.data === "string"
      ? error.response.data
      : JSON.stringify(error.response.data);
  }
  return error?.message ?? "Unexpected error";
};

export const signUp = async (email, password, username = null, fullName = null) => {
  const body = { email, password };
  if (username != null) body.username = username;
  if (fullName != null) body.fullName = fullName;
  const response = await client.post("/auth/signup", body);
  return response.data;
};

export const signIn = async (email, password) => {
  const response = await client.post("/auth/signin", { email, password });
  return response.data;
};

export const signOut = async (accessToken) => {
  const response = await client.post(
    "/auth/signout",
    null,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  return response.data;
};

export const authErrorMessage = (error) => parseError(error);
