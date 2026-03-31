import type {SlotConfiguration} from "@/types";
import axiosInstance from "./axiosConfig";

export const slotsApi = {
  getAvailable: async (params: {
    locationId: string;
    appointmentTypeId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await axiosInstance.get("/slots/available", {params});
    return response.data;
  },

  // Special Dates
  getSpecialDates: async () => {
    const response = await axiosInstance.get("/slots/special-dates");
    return response.data;
  },

  // Admin slot configs
  getSlotConfigurations: async () => {
    const response = await axiosInstance.get("/slots/configurations");
    return response.data;
  },
  createSlotConfiguration: async (data: SlotConfiguration) => {
    const response = await axiosInstance.post("/slots/configurations", data);
    return response.data;
  },
  updateSlotConfiguration: async (id: string, data: SlotConfiguration) => {
    const response = await axiosInstance.put(
      `/slots/configurations/${id}`,
      data,
    );
    return response.data;
  },
  deleteSlotConfiguration: async (id: string) => {
    const response = await axiosInstance.delete(`/slots/configurations/${id}`);
    return response.data;
  },
};
