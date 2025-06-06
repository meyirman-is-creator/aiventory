import { create } from "zustand";
import { warehouseApi } from "@/lib/api";
import { WarehouseItem, Upload, WarehouseItemStatus, UrgencyLevel } from "@/lib/types";

interface WarehouseFilters {
  search: string;
  category_sid: string | null;
  status: WarehouseItemStatus | null;
  urgency_level: UrgencyLevel | null;
  expire_soon: boolean;
}

interface WarehouseStore {
  items: WarehouseItem[];
  totalCount: number;
  filters: WarehouseFilters;
  isLoadingItems: boolean;
  isUploading: boolean;
  isMoving: boolean;
  isDeleting: boolean;
  error: string | null;
  
  setFilter: <K extends keyof WarehouseFilters>(key: K, value: WarehouseFilters[K]) => void;
  resetFilters: () => void;
  
  fetchItems: (skip?: number, limit?: number) => Promise<void>;
  uploadFile: (file: File) => Promise<Upload>;
  moveToStore: (itemSid: string, quantity: number, price: number) => Promise<{ store_item_sid: string; message: string }>;
  moveToStoreByBarcode: (barcode: string, quantity: number, price: number) => Promise<{ store_item_sid: string; message: string }>;
  deleteItems: (itemSids: string[]) => Promise<void>;
}

const initialFilters: WarehouseFilters = {
  search: "",
  category_sid: null,
  status: null,
  urgency_level: null,
  expire_soon: false,
};

export const useWarehouseStore = create<WarehouseStore>((set, get) => ({
  items: [],
  totalCount: 0,
  filters: initialFilters,
  isLoadingItems: false,
  isUploading: false,
  isMoving: false,
  isDeleting: false,
  error: null,

  setFilter: <K extends keyof WarehouseFilters>(key: K, value: WarehouseFilters[K]) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  fetchItems: async (skip = 0, limit?: number) => {
    set({ isLoadingItems: true, error: null });
    try {
      const filters = get().filters;
      const response = await warehouseApi.getItems({
        skip,
        limit,
        search: filters.search || undefined,
        category_sid: filters.category_sid || undefined,
        status: filters.status || undefined,
        urgency_level: filters.urgency_level || undefined,
        expire_soon: filters.expire_soon || undefined,
      });
      
      set({
        items: response.items,
        totalCount: response.total_count,
        isLoadingItems: false,
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch warehouse items";
      
      set({
        error: errorMessage,
        isLoadingItems: false,
      });
    }
  },

  uploadFile: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      const upload = await warehouseApi.uploadFile(file);
      await get().fetchItems();
      set({ isUploading: false });
      return upload;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to upload file";
      
      set({
        error: errorMessage,
        isUploading: false,
      });
      throw error;
    }
  },

  moveToStore: async (itemSid: string, quantity: number, price: number) => {
    set({ isMoving: true, error: null });
    try {
      const result = await warehouseApi.moveToStore(itemSid, quantity, price);
      await get().fetchItems();
      set({ isMoving: false });
      return result;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to move item to store";
      
      set({
        error: errorMessage,
        isMoving: false,
      });
      throw error;
    }
  },

  moveToStoreByBarcode: async (barcode: string, quantity: number, price: number) => {
    set({ isMoving: true, error: null });
    try {
      const result = await warehouseApi.moveToStoreByBarcode(barcode, quantity, price);
      await get().fetchItems();
      set({ isMoving: false });
      return result;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to move item to store by barcode";
      
      set({
        error: errorMessage,
        isMoving: false,
      });
      throw error;
    }
  },

  deleteItems: async (itemSids: string[]) => {
    set({ isDeleting: true, error: null });
    try {
      await warehouseApi.deleteItems(itemSids);
      await get().fetchItems();
      set({ isDeleting: false });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to delete items";
      
      set({
        error: errorMessage,
        isDeleting: false,
      });
      throw error;
    }
  },
}));