import axiosInstance from "./axiosConfig";

export const authApi = {
  signup: async (data: any) => {
    const response = await axiosInstance.post("/auth/signup", data);
    return response.data;
  },
  login: async (data: any) => {
    console.log(data);
    const response = await axiosInstance.post("/auth/login", data);
    console.log("response", response);
    return response.data;
  },
  me: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await axiosInstance.put("/auth/profile", data);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post("/auth/forgot-password", {email});
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await axiosInstance.post("/auth/change-password", data);
    return response.data;
  },
};
