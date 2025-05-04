// src/redux/slices/storeSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { storeApi } from "@/lib/api";
import { StoreItem, StoreReports, Discount, Sale } from "@/lib/types";

interface StoreState {
  activeItems: StoreItem[];
  expiredItems: StoreItem[];
  reports: StoreReports | null;
  isLoadingItems: boolean;
  isLoadingReports: boolean;
  error: string | null;
  lastFetchedItems: string | null;
  lastFetchedReports: string | null;
}

const initialState: StoreState = {
  activeItems: [],
  expiredItems: [],
  reports: null,
  isLoadingItems: false,
  isLoadingReports: false,
  error: null,
  lastFetchedItems: null,
  lastFetchedReports: null,
};

// Async thunk actions
export const fetchActiveItems = createAsyncThunk(
  "store/fetchActiveItems",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedItems;

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      new Date().getTime() - new Date(lastFetched).getTime() < 5 * 60 * 1000
    ) {
      return state.store.activeItems;
    }

    const activeItems = await storeApi.getItems("active");
    return activeItems;
  }
);

export const fetchExpiredItems = createAsyncThunk(
  "store/fetchExpiredItems",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedItems;

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      new Date().getTime() - new Date(lastFetched).getTime() < 5 * 60 * 1000
    ) {
      return state.store.expiredItems;
    }

    const expiredItems = await storeApi.getItems("expired");
    return expiredItems;
  }
);

export const fetchReports = createAsyncThunk(
  "store/fetchReports",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedReports;

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      new Date().getTime() - new Date(lastFetched).getTime() < 5 * 60 * 1000
    ) {
      return state.store.reports;
    }

    const reports = await storeApi.getReports();
    return reports;
  }
);

export const createDiscount = createAsyncThunk(
  "store/createDiscount",
  async (
    {
      storeItemSid,
      percentage,
      startsAt,
      endsAt,
    }: {
      storeItemSid: string;
      percentage: number;
      startsAt: Date;
      endsAt: Date;
    },
    { dispatch }
  ) => {
    const discount = await storeApi.createDiscount(
      storeItemSid,
      percentage,
      startsAt,
      endsAt
    );
    dispatch(fetchActiveItems());
    return discount;
  }
);

export const removeFromStore = createAsyncThunk(
  "store/removeFromStore",
  async (storeItemSid: string, { dispatch }) => {
    await storeApi.removeFromStore(storeItemSid);
    dispatch(fetchActiveItems());
    dispatch(fetchExpiredItems());
    return storeItemSid;
  }
);

export const recordSale = createAsyncThunk(
  "store/recordSale",
  async (
    {
      storeItemSid,
      soldQty,
      soldPrice,
    }: {
      storeItemSid: string;
      soldQty: number;
      soldPrice: number;
    },
    { dispatch }
  ) => {
    const sale = await storeApi.recordSale(storeItemSid, soldQty, soldPrice);
    dispatch(fetchActiveItems());
    dispatch(fetchReports());
    return { sale, storeItemSid, soldQty };
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchActiveItems
    builder
      .addCase(fetchActiveItems.pending, (state) => {
        state.isLoadingItems = true;
        state.error = null;
      })
      .addCase(
        fetchActiveItems.fulfilled,
        (state, action: PayloadAction<StoreItem[]>) => {
          state.activeItems = action.payload;
          state.isLoadingItems = false;
          state.lastFetchedItems = new Date().toISOString();
        }
      )
      .addCase(fetchActiveItems.rejected, (state, action) => {
        state.isLoadingItems = false;
        state.error = action.error.message || "Failed to fetch active items";
      });

    // Handle fetchExpiredItems
    builder
      .addCase(fetchExpiredItems.pending, (state) => {
        state.isLoadingItems = true;
        state.error = null;
      })
      .addCase(
        fetchExpiredItems.fulfilled,
        (state, action: PayloadAction<StoreItem[]>) => {
          state.expiredItems = action.payload;
          state.isLoadingItems = false;
          state.lastFetchedItems = new Date().toISOString();
        }
      )
      .addCase(fetchExpiredItems.rejected, (state, action) => {
        state.isLoadingItems = false;
        state.error = action.error.message || "Failed to fetch expired items";
      });

    // Handle fetchReports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoadingReports = true;
        state.error = null;
      })
      .addCase(
        fetchReports.fulfilled,
        (state, action: PayloadAction<StoreReports | null>) => {
          state.reports = action.payload;
          state.isLoadingReports = false;
          state.lastFetchedReports = new Date().toISOString();
        }
      )
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoadingReports = false;
        state.error = action.error.message || "Failed to fetch reports";
      });
  },
});

export default storeSlice.reducer;
