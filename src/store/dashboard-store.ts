import { create } from "zustand";
import { dashboardApi } from "@/lib/api";
import { DashboardStats } from "@/lib/types";

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  fetchStats: () => Promise<void>;
}

const DEFAULT_STATS: DashboardStats = {
  total_products: 0,
  products_in_warehouse: 0,
  products_in_store: 0,
  products_expiring_soon: 0,
  total_revenue_last_30_days: 0,
  total_sales_last_30_days: 0,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchStats: async () => {
    const current = new Date();
    const lastFetched = get().lastFetched;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 1 * 60 * 1000
    ) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const stats = await dashboardApi.getStats();
      set({
        stats,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch dashboard stats";
      
      set({
        error: errorMessage,
        isLoading: false,
        stats: DEFAULT_STATS,
      });
    }
  },
}));