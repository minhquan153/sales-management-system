import { apiRequest } from "./client.js";

export const getDashboard = () => apiRequest("/dashboard");
