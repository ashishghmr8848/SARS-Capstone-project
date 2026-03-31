import axiosInstance from "./axiosConfig";

export const appointmentsApi = {
  getAll: async (params?: {search?: string}) => {
    const response = await axiosInstance.get("/appointments", {params});
    return response.data;
  },
  getById: async (id: {id: string}) => {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  },
  create: async (data: {typeName: string; description: string}) => {
    const response = await axiosInstance.post("/appointments", data);
    return response.data;
  },
  update: async (
    id: string,
    data: {
      typeName: string;
      description: string;
    },
  ) => {
    const response = await axiosInstance.put(`/appointments/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/appointments/${id}`);
    return response.data;
  },
};
