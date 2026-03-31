import axiosInstance from "./axiosConfig";

export const locationsApi = {
  getAll: async (params?: {locationName?: string; zipCode?: string}) => {
    const response = await axiosInstance.get("/locations", {params});
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/locations/${id}`);
    return response.data;
  },
  create: async (data: {
    locationName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    const response = await axiosInstance.post("/locations", data);
    return response.data;
  },
  update: async (
    id: string,
    data: {
      locationName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    },
  ) => {
    const response = await axiosInstance.put(`/locations/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/locations/${id}`);
    return response.data;
  },
};
