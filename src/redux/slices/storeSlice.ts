import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { storeApi } from "@/lib/api";
import { StoreItem, RemovedItem, StoreReports, Sale } from "@/lib/types";

interface StoreState {
  activeItems: StoreItem[];
  removedItems: RemovedItem[];
  salesHistory: Sale[];
  reports: StoreReports | null;
  isLoadingItems: boolean;
  isLoadingRemovedItems: boolean;
  isLoadingSales: boolean;
  isLoadingReports: boolean;
  error: string | null;
  lastFetchedItems: string | null;
  lastFetchedRemovedItems: string | null;
  lastFetchedSales: string | null;
  lastFetchedReports: string | null;
}

const initialState: StoreState = {
  activeItems: [],
  removedItems: [],
  salesHistory: [],
  reports: null,
  isLoadingItems: false,
  isLoadingRemovedItems: false,
  isLoadingSales: false,
  isLoadingReports: false,
  error: null,
  lastFetchedItems: null,
  lastFetchedRemovedItems: null,
  lastFetchedSales: null,
  lastFetchedReports: null,
};

export const fetchActiveItems = createAsyncThunk(
  "store/fetchActiveItems",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedItems;

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

export const fetchRemovedItems = createAsyncThunk(
  "store/fetchRemovedItems",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedRemovedItems;

    if (
      lastFetched &&
      new Date().getTime() - new Date(lastFetched).getTime() < 5 * 60 * 1000
    ) {
      return state.store.removedItems;
    }

    const removedItems = await storeApi.getRemovedItems();
    return removedItems;
  }
);

export const fetchSalesHistory = createAsyncThunk(
  "store/fetchSalesHistory",
  async ({ startDate, endDate }: { startDate?: Date; endDate?: Date } = {}, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedSales;

    if (
      !startDate &&
      !endDate &&
      lastFetched &&
      new Date().getTime() - new Date(lastFetched).getTime() < 5 * 60 * 1000
    ) {
      return state.store.salesHistory;
    }

    const sales = await storeApi.getSales(startDate, endDate);
    return sales;
  }
);

export const fetchReports = createAsyncThunk(
  "store/fetchReports",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const lastFetched = state.store.lastFetchedReports;

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
    dispatch(fetchRemovedItems());
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
    dispatch(fetchSalesHistory({}));
    return { sale, storeItemSid, soldQty };
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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

    builder
      .addCase(fetchRemovedItems.pending, (state) => {
        state.isLoadingRemovedItems = true;
        state.error = null;
      })
      .addCase(
        fetchRemovedItems.fulfilled,
        (state, action: PayloadAction<RemovedItem[]>) => {
          state.removedItems = action.payload;
          state.isLoadingRemovedItems = false;
          state.lastFetchedRemovedItems = new Date().toISOString();
        }
      )
      .addCase(fetchRemovedItems.rejected, (state, action) => {
        state.isLoadingRemovedItems = false;
        state.error = action.error.message || "Failed to fetch removed items";
      });

    builder
      .addCase(fetchSalesHistory.pending, (state) => {
        state.isLoadingSales = true;
        state.error = null;
      })
      .addCase(
        fetchSalesHistory.fulfilled,
        (state, action: PayloadAction<Sale[]>) => {
          state.salesHistory = action.payload;
          state.isLoadingSales = false;
          state.lastFetchedSales = new Date().toISOString();
        }
      )
      .addCase(fetchSalesHistory.rejected, (state, action) => {
        state.isLoadingSales = false;
        state.error = action.error.message || "Failed to fetch sales history";
      });

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