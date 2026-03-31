import axiosInstance from "./axiosConfig";

interface JoinWaitlistParams {
  appointmentTypeId: string;
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  preferredDateStart?: string;
  preferredDateEnd?: string;
  notes?: string;
}

export const waitlistApi = {
  join: (data: JoinWaitlistParams) => axiosInstance.post("/waitlist", data),
  getAll: (params?: { locationId?: string; appointmentTypeId?: string; status?: string }) =>
    axiosInstance.get("/waitlist", { params }),
};
