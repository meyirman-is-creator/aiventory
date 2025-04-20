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

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 5 * 60 * 1000
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
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to fetch dashboard stats",
        isLoading: false,
        stats: DEFAULT_STATS,
      });
    }
  },
}));
