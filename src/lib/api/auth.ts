import apiClient from "./apiClient";

export const register = async (email: string, password: string) => {
  return apiClient.post("/auth/register", { email, password });
};

export const verifyEmail = async (email: string, code: string) => {
  return apiClient.post("/auth/verify", { email, code });
};

export const login = async (email: string, password: string) => {
  return apiClient.post("/auth/login", { email, password });
};
