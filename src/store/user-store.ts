import { create } from "zustand";
import { authApi } from "@/lib/api";
import { User } from "@/lib/types";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  verify: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  token:
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  isAuthenticated:
    typeof window !== "undefined"
      ? !!localStorage.getItem("accessToken")
      : false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem("accessToken", response.access_token);
      set({
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Login failed";
      
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.register(email, password);
      set({ user, isLoading: false });
      return user;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Registration failed";
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  verify: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.verify(email, code);
      set({ user, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Verification failed";
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      localStorage.removeItem("accessToken");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      localStorage.removeItem("accessToken");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  checkAuth: () => {
    const token = localStorage.getItem("accessToken");
    const isAuthenticated = !!token;
    set({ token, isAuthenticated });
    return isAuthenticated;
  },
}));
