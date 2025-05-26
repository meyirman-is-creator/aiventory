import { create } from "zustand";
import { storeApi } from "@/lib/api";
import { StoreItem, StoreReports, Discount, Sale } from "@/lib/types";

interface StoreItemsState {
  activeItems: StoreItem[];
  expiredItems: StoreItem[];
  reports: StoreReports | null;
  isLoadingItems: boolean;
  isLoadingReports: boolean;
  error: string | null;
  lastFetchedItems: Date | null;
  lastFetchedReports: Date | null;
  fetchActiveItems: () => Promise<void>;
  fetchExpiredItems: () => Promise<void>;
  fetchReports: (startDate?: Date, endDate?: Date) => Promise<void>;
  createDiscount: (
    storeItemSid: string,
    percentage: number,
    startsAt: Date,
    endsAt: Date
  ) => Promise<Discount>;
  markAsExpired: (storeItemSid: string) => Promise<void>;
  removeFromStore: (storeItemSid: string) => Promise<void>;
  recordSale: (
    storeItemSid: string,
    soldQty: number,
    soldPrice: number
  ) => Promise<Sale>;
}

export const useStoreItemsStore = create<StoreItemsState>((set, get) => ({
  activeItems: [],
  expiredItems: [],
  reports: null,
  isLoadingItems: false,
  isLoadingReports: false,
  error: null,
  lastFetchedItems: null,
  lastFetchedReports: null,

  fetchActiveItems: async () => {
    const current = new Date();
    const lastFetched = get().lastFetchedItems;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 1 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingItems: true, error: null });
    try {
      const activeItems = await storeApi.getItems("active");
      set({
        activeItems,
        isLoadingItems: false,
        lastFetchedItems: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch active store items";
      
      set({
        error: errorMessage,
        isLoadingItems: false,
      });
    }
  },

  fetchExpiredItems: async () => {
    const current = new Date();
    const lastFetched = get().lastFetchedItems;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 1 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingItems: true, error: null });
    try {
      const expiredItems = await storeApi.getItems("expired");
      set({
        expiredItems,
        isLoadingItems: false,
        lastFetchedItems: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch expired store items";
      
      set({
        error: errorMessage,
        isLoadingItems: false,
      });
    }
  },

  fetchReports: async (startDate?: Date, endDate?: Date) => {
    const current = new Date();
    const lastFetched = get().lastFetchedReports;

    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 1 * 60 * 1000 &&
      !startDate &&
      !endDate
    ) {
      return;
    }

    set({ isLoadingReports: true, error: null });
    try {
      const reports = await storeApi.getReports(startDate, endDate);
      set({
        reports,
        isLoadingReports: false,
        lastFetchedReports: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch store reports";
      
      set({
        error: errorMessage,
        isLoadingReports: false,
      });
    }
  },

  createDiscount: async (
    storeItemSid: string,
    percentage: number,
    startsAt: Date,
    endsAt: Date
  ) => {
    set({ error: null });
    try {
      const discount = await storeApi.createDiscount(
        storeItemSid,
        percentage,
        startsAt,
        endsAt
      );

      const activeItems = get().activeItems.map((item) => {
        if (item.sid === storeItemSid) {
          return {
            ...item,
            current_discounts: [...item.current_discounts, discount],
          };
        }
        return item;
      });

      set({ activeItems });
      return discount;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to create discount";
      
      set({
        error: errorMessage,
      });
      throw error;
    }
  },

  markAsExpired: async (storeItemSid: string) => {
    set({ error: null });
    try {
      const updatedItem = await storeApi.markAsExpired(storeItemSid);

      const activeItems = get().activeItems.filter(
        (item) => item.sid !== storeItemSid
      );
      const expiredItems = [...get().expiredItems, updatedItem];

      set({ activeItems, expiredItems });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to mark item as expired";
      
      set({
        error: errorMessage,
      });
      throw error;
    }
  },

  removeFromStore: async (storeItemSid: string) => {
    set({ error: null });
    try {
      await storeApi.removeFromStore(storeItemSid);

      const activeItems = get().activeItems.filter(
        (item) => item.sid !== storeItemSid
      );
      const expiredItems = get().expiredItems.filter(
        (item) => item.sid !== storeItemSid
      );

      set({ activeItems, expiredItems });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to remove item from store";
      
      set({
        error: errorMessage,
      });
      throw error;
    }
  },

  recordSale: async (
    storeItemSid: string,
    soldQty: number,
    soldPrice: number
  ) => {
    set({ error: null });
    try {
      const sale = await storeApi.recordSale(storeItemSid, soldQty, soldPrice);

      const activeItems = get()
        .activeItems.map((item) => {
          if (item.sid === storeItemSid) {
            if (item.quantity - soldQty <= 0) {
              return null;
            }

            return {
              ...item,
              quantity: item.quantity - soldQty,
            };
          }
          return item;
        })
        .filter(Boolean) as StoreItem[];

      set({ activeItems });
      
      setTimeout(() => {
        get().fetchReports();
      }, 1000);
      
      return sale;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to record sale";
      
      set({
        error: errorMessage,
      });
      throw error;
    }
  },
}));