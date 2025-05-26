import { create } from "zustand";
import { predictionApi } from "@/lib/api";
import { Prediction, PredictionStats, ProductCategory, ProductResponse, TimeFrame } from "@/lib/types";

interface Analytics {
  trends?: {
    trend?: string;
    growth?: {
      quantity?: number;
      revenue?: number;
    };
  };
  kpis?: {
    turnover_rate?: number;
    days_of_supply?: number;
    avg_monthly_sales?: number;
    avg_monthly_revenue?: number;
  };
  inventory?: {
    nearest_expiry?: string;
  };
}

interface PredictionState {
  predictions: Record<string, Prediction[]>;
  products: ProductResponse[];
  categories: ProductCategory[];
  stats: PredictionStats | null;
  analytics: Analytics | null;
  selectedProductSid: string | null;
  selectedTimeframe: TimeFrame;
  selectedPeriods: number;
  isLoadingPredictions: boolean;
  isLoadingStats: boolean;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;
  lastFetchedPredictions: Record<string, Date>;
  lastFetchedStats: Date | null;
  lastFetchedProducts: Date | null;
  lastFetchedCategories: Date | null;
  lastFetchedAnalytics: Record<string, Date>;
  fetchPredictions: (productSid: string, refresh?: boolean, timeframe?: TimeFrame, periods?: number) => Promise<void>;
  fetchStats: (productSid?: string, startDate?: Date, endDate?: Date) => Promise<void>;
  fetchProducts: (category_sid?: string, search?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchAnalytics: (productSid: string) => Promise<void>;
  setSelectedProduct: (productSid: string | null) => void;
  setSelectedTimeframe: (timeframe: TimeFrame) => void;
  setSelectedPeriods: (periods: number) => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: {},
  products: [],
  categories: [],
  stats: null,
  analytics: null,
  selectedProductSid: null,
  selectedTimeframe: TimeFrame.MONTH,
  selectedPeriods: 3,
  isLoadingPredictions: false,
  isLoadingStats: false,
  isLoadingProducts: false,
  isLoadingCategories: false,
  isLoadingAnalytics: false,
  error: null,
  lastFetchedPredictions: {},
  lastFetchedStats: null,
  lastFetchedProducts: null,
  lastFetchedCategories: null,
  lastFetchedAnalytics: {},

  fetchPredictions: async (productSid: string, refresh = false, timeframe = TimeFrame.MONTH, periods = 3) => {
    const current = new Date();
    const lastFetched = get().lastFetchedPredictions[productSid];

    if (
      !refresh &&
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 10 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingPredictions: true, error: null });
    try {
      const predictions = await predictionApi.getForecast(
        productSid,
        refresh,
        timeframe,
        periods
      );

      set((state) => ({
        predictions: {
          ...state.predictions,
          [productSid]: predictions,
        },
        isLoadingPredictions: false,
        lastFetchedPredictions: {
          ...state.lastFetchedPredictions,
          [productSid]: new Date(),
        },
      }));
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch predictions";
      
      set({
        error: errorMessage,
        isLoadingPredictions: false,
      });
    }
  },

  fetchStats: async (productSid?: string, startDate?: Date, endDate?: Date) => {
    const current = new Date();
    const lastFetched = get().lastFetchedStats;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 10 * 60 * 1000 &&
      !productSid &&
      !startDate &&
      !endDate
    ) {
      return;
    }

    set({ isLoadingStats: true, error: null });
    try {
      const stats = await predictionApi.getStats(
        productSid,
        startDate,
        endDate
      );
      set({
        stats,
        isLoadingStats: false,
        lastFetchedStats: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch prediction stats";
      
      set({
        error: errorMessage,
        isLoadingStats: false,
      });
    }
  },

  fetchProducts: async (category_sid?: string, search?: string) => {
    const current = new Date();
    const lastFetched = get().lastFetchedProducts;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 10 * 60 * 1000 &&
      !category_sid &&
      !search
    ) {
      return;
    }

    set({ isLoadingProducts: true, error: null });
    try {
      const products = await predictionApi.getProducts(category_sid, search);
      set({
        products,
        isLoadingProducts: false,
        lastFetchedProducts: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch products";
      
      set({
        error: errorMessage,
        isLoadingProducts: false,
      });
    }
  },

  fetchCategories: async () => {
    const current = new Date();
    const lastFetched = get().lastFetchedCategories;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 30 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingCategories: true, error: null });
    try {
      const categories = await predictionApi.getCategories();
      set({
        categories,
        isLoadingCategories: false,
        lastFetchedCategories: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch categories";
      
      set({
        error: errorMessage,
        isLoadingCategories: false,
      });
    }
  },

  fetchAnalytics: async (productSid: string) => {
    const current = new Date();
    const lastFetched = get().lastFetchedAnalytics[productSid];

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 10 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingAnalytics: true, error: null });
    try {
      const analytics = await predictionApi.getAnalytics(productSid);
      set((state) => ({
        analytics,
        isLoadingAnalytics: false,
        lastFetchedAnalytics: {
          ...state.lastFetchedAnalytics,
          [productSid]: new Date(),
        },
      }));
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch analytics";
      
      set({
        error: errorMessage,
        isLoadingAnalytics: false,
      });
    }
  },

  setSelectedProduct: (productSid: string | null) => {
    set({ selectedProductSid: productSid });
  },

  setSelectedTimeframe: (timeframe: TimeFrame) => {
    set({ selectedTimeframe: timeframe });

    const productSid = get().selectedProductSid;
    if (productSid) {
      get().fetchPredictions(productSid, true, timeframe, get().selectedPeriods);
    }
  },

  setSelectedPeriods: (periods: number) => {
    set({ selectedPeriods: periods });

    const productSid = get().selectedProductSid;
    if (productSid) {
      get().fetchPredictions(productSid, true, get().selectedTimeframe, periods);
    }
  },
}));