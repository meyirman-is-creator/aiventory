import { create } from "zustand";

export type PredictionData = {
  itemId: number;
  name: string;
  category: string;
  forecast: {
    date: string;
    value: number;
  }[];
  recommendation: string;
};

type PredictionState = {
  predictions: PredictionData[];
  selectedItemId: number | null;
  loading: boolean;
  error: string | null;
  setPredictions: (predictions: PredictionData[]) => void;
  setSelectedItemId: (itemId: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const usePredictionStore = create<PredictionState>((set) => ({
  predictions: [],
  selectedItemId: null,
  loading: false,
  error: null,
  setPredictions: (predictions) => set({ predictions }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
