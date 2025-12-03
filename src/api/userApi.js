import { request } from "./apiClient";

export function getBudget(userId) {
  return request(`/api/user/budget?userId=${userId}`, { method: "GET" });
}

export function setBudget(userId, newBudget) {
  return request(`/api/user/setBudget?userId=${userId}`, {
    method: "PUT",
    body: JSON.stringify(newBudget),
  });
}