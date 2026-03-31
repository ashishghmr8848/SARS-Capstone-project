import {create} from "zustand";
import {type User} from "../types";
import {authApi} from "../api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (data) => Promise<void>;
  signup: (data) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  setUser: (user) => set({user}),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({token});
  },
  login: async (data) => {
    set({loading: true});
    try {
      const response = await authApi.login(data);
      console.log("response", response);
      // Expected response: { success: true, data: { user, token } }
      const {user, token} = response.data;
      get().setToken(token);
      get().setUser(user);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      set({loading: false});
    }
  },
  signup: async (data) => {
    set({loading: true});
    try {
      const response = await authApi.signup(data);
      // Expected response: { success: true, data: { user, token } }
      const {user, token} = response.data;
      get().setToken(token);
      get().setUser(user);
    } catch (error) {
      console.error("Signup failed", error);
      throw error;
    } finally {
      set({loading: false});
    }
  },
  logout: () => {
    get().setToken(null);
    get().setUser(null);
  },
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({loading: false, user: null});
      return;
    }
    set({loading: true});
    try {
      const response = await authApi.me();
      // Expected response: { success: true, data: { user } }
      set({user: response.data});
    } catch (error) {
      console.error("Check auth failed", error);
      get().logout();
    } finally {
      set({loading: false});
    }
  },
}));
