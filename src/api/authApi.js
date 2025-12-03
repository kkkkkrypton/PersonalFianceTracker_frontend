import { request } from "./apiClient";

export function registerUser(user) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function fetchUserTypes() {
  return request("/api/auth/user-types", { method: "GET" });
}