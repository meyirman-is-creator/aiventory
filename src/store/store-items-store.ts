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

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 5 * 60 * 1000
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
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to fetch active store items",
        isLoadingItems: false,
      });
    }
  },

  fetchExpiredItems: async () => {
    const current = new Date();
    const lastFetched = get().lastFetchedItems;

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 5 * 60 * 1000
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
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to fetch expired store items",
        isLoadingItems: false,
      });
    }
  },

  fetchReports: async (startDate?: Date, endDate?: Date) => {
    const current = new Date();
    const lastFetched = get().lastFetchedReports;

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 5 * 60 * 1000 &&
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
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch store reports",
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

      // Update active items with new discount
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
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to create discount",
      });
      throw error;
    }
  },

  markAsExpired: async (storeItemSid: string) => {
    set({ error: null });
    try {
      const updatedItem = await storeApi.markAsExpired(storeItemSid);

      // Update store items lists
      const activeItems = get().activeItems.filter(
        (item) => item.sid !== storeItemSid
      );
      const expiredItems = [...get().expiredItems, updatedItem];

      set({ activeItems, expiredItems });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to mark item as expired",
      });
      throw error;
    }
  },

  removeFromStore: async (storeItemSid: string) => {
    set({ error: null });
    try {
      await storeApi.removeFromStore(storeItemSid);

      // Update store items lists
      const activeItems = get().activeItems.filter(
        (item) => item.sid !== storeItemSid
      );
      const expiredItems = get().expiredItems.filter(
        (item) => item.sid !== storeItemSid
      );

      set({ activeItems, expiredItems });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to remove item from store",
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

      // Update active items
      const activeItems = get()
        .activeItems.map((item) => {
          if (item.sid === storeItemSid) {
            // If quantity is now 0, remove from active items
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
      return sale;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to record sale",
      });
      throw error;
    }
  },
}));
