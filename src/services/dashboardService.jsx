import api from "./api";

// Get dashboard summary
export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};