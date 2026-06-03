import apiClient from "./client";

// Registration
export const registerRequest = (data) =>
  apiClient.post("/auth/register-request", data);

export const registerVerify = (data) =>
  apiClient.post("/auth/register-verify", data);

// Login
export const loginRequest = (data) =>
  apiClient.post("/auth/login-request", data);

export const loginVerify = (data) =>
  apiClient.post("/auth/login-verify", data);

// User
export const getMe = () => apiClient.get("/auth/get-me");

// Logout
export const logout = () => apiClient.post("/auth/logout");
export const logoutAll = () => apiClient.post("/auth/logout-all");

// Password reset
export const forgotPassword = (email) =>
  apiClient.post("/auth/forgot-password", { email });

export const resetPassword = (token, newPassword) =>
  apiClient.patch(`/auth/reset-password/${token}`, { password: newPassword });