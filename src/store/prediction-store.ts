import { create } from "zustand";
import { predictionApi } from "@/lib/api";
import { ProductResponse, ProductCategory, TimeFrame } from "@/lib/types";

interface PredictionState {
  products: ProductResponse[];
  categories: ProductCategory[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  selectedProductSid: string | null;
  selectedTimeframe: TimeFrame;
  selectedPeriods: number;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  generateThreeMonthForecast: (productSid: string) => Promise<void>;
  fetchPredictions: (productSid: string, refresh?: boolean) => Promise<void>;
  setSelectedTimeframe: (timeframe: TimeFrame) => void;
  setSelectedPeriods: (periods: number) => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  products: [],
  categories: [],
  isLoadingProducts: false,
  isLoadingCategories: false,
  error: null,
  selectedProductSid: null,
  selectedTimeframe: TimeFrame.WEEK,
  selectedPeriods: 4,

  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setSelectedPeriods: (periods) => set({ selectedPeriods: periods }),

  fetchProducts: async () => {
    set({ isLoadingProducts: true, error: null });
    try {
      const products = await predictionApi.getProducts();
      set({ products, isLoadingProducts: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch products",
        isLoadingProducts: false,
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true, error: null });
    try {
      const categories = await predictionApi.getCategories();
      set({ categories, isLoadingCategories: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch categories",
        isLoadingCategories: false,
      });
    }
  },

  generateThreeMonthForecast: async (productSid: string) => {
    set({ error: null });
    try {
      await predictionApi.generateThreeMonthForecast(productSid);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to generate forecast",
      });
      throw error;
    }
  },

  fetchPredictions: async (productSid: string, refresh?: boolean) => {
    set({ error: null });
    try {
      await predictionApi.fetchPredictions(productSid, refresh);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch predictions",
      });
      throw error;
    }
  },
}));