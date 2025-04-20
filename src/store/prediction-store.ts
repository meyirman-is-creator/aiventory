import { create } from "zustand";
import { predictionApi } from "@/lib/api";
import { Prediction, PredictionStats, TimeFrame } from "@/lib/types";

interface PredictionState {
  predictions: Record<string, Prediction[]>; // product_sid -> predictions
  stats: PredictionStats | null;
  selectedProductSid: string | null;
  selectedTimeframe: TimeFrame;
  selectedPeriods: number;
  isLoadingPredictions: boolean;
  isLoadingStats: boolean;
  error: string | null;
  lastFetchedPredictions: Record<string, Date>; // product_sid -> date
  lastFetchedStats: Date | null;
  fetchPredictions: (productSid: string, refresh?: boolean) => Promise<void>;
  fetchStats: (
    productSid?: string,
    startDate?: Date,
    endDate?: Date
  ) => Promise<void>;
  setSelectedProduct: (productSid: string | null) => void;
  setSelectedTimeframe: (timeframe: TimeFrame) => void;
  setSelectedPeriods: (periods: number) => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: {},
  stats: null,
  selectedProductSid: null,
  selectedTimeframe: TimeFrame.MONTH,
  selectedPeriods: 3,
  isLoadingPredictions: false,
  isLoadingStats: false,
  error: null,
  lastFetchedPredictions: {},
  lastFetchedStats: null,

  fetchPredictions: async (productSid: string, refresh = false) => {
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

    const timeframe = get().selectedTimeframe;
    const periods = get().selectedPeriods;

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

  setSelectedProduct: (productSid: string | null) => {
    set({ selectedProductSid: productSid });
  },

  setSelectedTimeframe: (timeframe: TimeFrame) => {
    set({ selectedTimeframe: timeframe });

    // If we have a selected product, fetch new predictions with this timeframe
    const productSid = get().selectedProductSid;
    if (productSid) {
      get().fetchPredictions(productSid, true);
    }
  },

  setSelectedPeriods: (periods: number) => {
    set({ selectedPeriods: periods });

    // If we have a selected product, fetch new predictions with this number of periods
    const productSid = get().selectedProductSid;
    if (productSid) {
      get().fetchPredictions(productSid, true);
    }
  },
}));
