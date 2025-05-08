// src/store/prediction-store.ts
import { create } from "zustand";
import { predictionApi } from "@/lib/api";
import { Prediction, PredictionStats, ProductCategory, ProductResponse, TimeFrame } from "@/lib/types";

interface PredictionState {
  predictions: Record<string, Prediction[]>; // product_sid -> predictions
  products: ProductResponse[];
  categories: ProductCategory[];
  stats: PredictionStats | null;
  selectedProductSid: string | null;
  selectedTimeframe: TimeFrame;
  selectedPeriods: number;
  isLoadingPredictions: boolean;
  isLoadingStats: boolean;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  lastFetchedPredictions: Record<string, Date>; // product_sid -> date
  lastFetchedStats: Date | null;
  lastFetchedProducts: Date | null;
  lastFetchedCategories: Date | null;
  fetchPredictions: (productSid: string, refresh?: boolean, timeframe?: TimeFrame, periods?: number) => Promise<void>;
  fetchStats: (productSid?: string, startDate?: Date, endDate?: Date) => Promise<void>;
  fetchProducts: (category_sid?: string, search?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedProduct: (productSid: string | null) => void;
  setSelectedTimeframe: (timeframe: TimeFrame) => void;
  setSelectedPeriods: (periods: number) => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: {},
  products: [],
  categories: [],
  stats: null,
  selectedProductSid: null,
  selectedTimeframe: TimeFrame.MONTH,
  selectedPeriods: 3,
  isLoadingPredictions: false,
  isLoadingStats: false,
  isLoadingProducts: false,
  isLoadingCategories: false,
  error: null,
  lastFetchedPredictions: {},
  lastFetchedStats: null,
  lastFetchedProducts: null,
  lastFetchedCategories: null,

  fetchPredictions: async (productSid: string, refresh = false, timeframe = TimeFrame.MONTH, periods = 3) => {
    const current = new Date();
    const lastFetched = get().lastFetchedPredictions[productSid];

    // If data was fetched in the last 10 minutes and not forcing refresh, don't fetch again
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

      // Update predictions for this product
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
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch predictions",
        isLoadingPredictions: false,
      });
    }
  },

  fetchStats: async (productSid?: string, startDate?: Date, endDate?: Date) => {
    const current = new Date();
    const lastFetched = get().lastFetchedStats;

    // If data was fetched in the last 10 minutes, don't fetch again
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
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to fetch prediction stats",
        isLoadingStats: false,
      });
    }
  },

  fetchProducts: async (category_sid?: string, search?: string) => {
    const current = new Date();
    const lastFetched = get().lastFetchedProducts;

    // If data was fetched in the last 10 minutes and no filters are applied, don't fetch again
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
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch products",
        isLoadingProducts: false,
      });
    }
  },

  fetchCategories: async () => {
    const current = new Date();
    const lastFetched = get().lastFetchedCategories;

    // If data was fetched in the last 30 minutes, don't fetch again
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
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch categories",
        isLoadingCategories: false,
      });
    }
  },

  setSelectedProduct: (productSid: string | null) => {
    set({ selectedProductSid: productSid });
  },

  setSelectedTimeframe: (timeframe: TimeFrame) => {
    set({ selectedTimeframe: timeframe });

    // If we have a selected product, fetch new predictions with this timeframe
    const productSid = get().selectedProductSid;
    if (productSid) {
      get().fetchPredictions(productSid, true, timeframe, get().selectedPeriods);
    }
  },

  setSelectedPeriods: (periods: number) => {
    set({ selectedPeriods: periods });

    // If we have a selected product, fetch new predictions with this number of periods
    const productSid = get().selectedProductSid;
    if (productSid) {
      get().fetchPredictions(productSid, true, get().selectedTimeframe, periods);
    }
  },
}));