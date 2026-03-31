import axiosInstance from "./axiosConfig";

export const adminApi = {
  getStatistics: async () => {
    const response = await axiosInstance.get("/admin/statistics");
    return response.data;
  },
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await axiosInstance.get("/admin/bookings", {params});
    return response.data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/admin/bookings/${id}/status`, {
      status,
    });
    return response.data;
  },
  cancelBooking: async (id: string, reason?: string) => {
    const response = await axiosInstance.put(`/admin/bookings/${id}/cancel`, {
      reason,
    });
    return response.data;
  },
  getUsers: async () => {
    const response = await axiosInstance.get("/admin/users");
    return response.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const response = await axiosInstance.put(`/admin/users/${id}/role`, {role});
    return response.data;
  },
  // Special Dates
  getSpecialDates: async () => {
    const response = await axiosInstance.get("/admin/special-dates");
    return response.data;
  },
  createSpecialDate: async (data: {
    date: string;
    dateType: "HOLIDAY" | "CLOSURE" | "MODIFIED_HOURS";
    reason?: string;
    isClosed?: boolean;
    modifiedStartTime?: string;
    modifiedEndTime?: string;
    appliesToAllLocations?: boolean;
    appliesToAllAppointmentTypes?: boolean;
  }) => {
    const response = await axiosInstance.post("/admin/special-dates", data);
    return response.data;
  },
  deleteSpecialDate: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/special-dates/${id}`);
    return response.data;
  },
};
