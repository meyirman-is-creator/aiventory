import { create } from 'zustand';
import { dashboardApi } from '@/lib/api';

interface DashboardStats {
  total_products: number;
  products_in_warehouse: number;
  products_in_store: number;
  products_expiring_soon: number;
  total_revenue_last_30_days: number;
  total_sales_last_30_days: number;
  revenue_change: number;
  sales_change: number;
  avg_check: number;
  avg_check_change: number;
  conversion_rate: number;
  conversion_change: number;
  category_distribution: Array<{
    name: string;
    value: number;
    product_count: number;
  }>;
  top_products: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
}

interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Всегда получаем свежие данные без кэширования
      const stats = await dashboardApi.getStats();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isLoading: false 
      });
    }
  },
}));