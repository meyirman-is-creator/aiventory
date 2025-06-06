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

interface WarehouseSorting {
  sort_by: string;
  sort_order: "asc" | "desc";
}

interface WarehouseStore {
  items: WarehouseItem[];
  filteredItems: WarehouseItem[];
  totalCount: number;
  filters: WarehouseFilters;
  sorting: WarehouseSorting;
  isLoadingItems: boolean;
  isUploading: boolean;
  isMoving: boolean;
  isDeleting: boolean;
  error: string | null;
  selectedItems: Set<string>;
  
  setFilter: <K extends keyof WarehouseFilters>(key: K, value: WarehouseFilters[K]) => void;
  setSorting: (sort_by: string, sort_order: "asc" | "desc") => void;
  resetFilters: () => void;
  applyFiltersAndSorting: () => void;
  
  fetchItems: (skip?: number, limit?: number) => Promise<void>;
  uploadFile: (file: File) => Promise<Upload>;
  moveToStore: (itemSid: string, quantity: number, price: number) => Promise<{ store_item_sid: string; message: string }>;
  moveToStoreByBarcode: (barcode: string, quantity: number, price: number) => Promise<{ store_item_sid: string; message: string }>;
  deleteItems: (itemSids: string[]) => Promise<void>;
  
  toggleItemSelection: (itemSid: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelectedItems: () => Promise<void>;
}

const initialFilters: WarehouseFilters = {
  search: "",
  category_sid: null,
  status: null,
  urgency_level: null,
  expire_soon: false,
};

const initialSorting: WarehouseSorting = {
  sort_by: "urgency_level",
  sort_order: "desc",
};

const urgencyOrder = {
  [UrgencyLevel.CRITICAL]: 3,
  [UrgencyLevel.URGENT]: 2,
  [UrgencyLevel.NORMAL]: 1,
};

export const useWarehouseStore = create<WarehouseStore>((set, get) => ({
  items: [],
  filteredItems: [],
  totalCount: 0,
  filters: initialFilters,
  sorting: initialSorting,
  isLoadingItems: false,
  isUploading: false,
  isMoving: false,
  isDeleting: false,
  error: null,
  selectedItems: new Set(),

  setFilter: <K extends keyof WarehouseFilters>(key: K, value: WarehouseFilters[K]) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
    get().applyFiltersAndSorting();
  },

  setSorting: (sort_by: string, sort_order: "asc" | "desc") => {
    set({ sorting: { sort_by, sort_order } });
    get().applyFiltersAndSorting();
  },

  resetFilters: () => {
    set({ filters: initialFilters, sorting: initialSorting });
    get().applyFiltersAndSorting();
  },

  applyFiltersAndSorting: () => {
    const { items, filters, sorting } = get();
    
    let filtered = [...items];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.product.name.toLowerCase().includes(searchLower) ||
        (item.product.barcode && item.product.barcode.toLowerCase().includes(searchLower)) ||
        (item.batch_code && item.batch_code.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category_sid) {
      filtered = filtered.filter(item => item.product.category_sid === filters.category_sid);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.urgency_level) {
      filtered = filtered.filter(item => item.urgency_level === filters.urgency_level);
    }

    if (filters.expire_soon) {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      filtered = filtered.filter(item => {
        if (!item.expire_date) return false;
        const expireDate = new Date(item.expire_date);
        return expireDate <= sevenDaysLater && expireDate >= today;
      });
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sorting.sort_by === "urgency_level") {
        const aUrgency = urgencyOrder[a.urgency_level || UrgencyLevel.NORMAL] || 0;
        const bUrgency = urgencyOrder[b.urgency_level || UrgencyLevel.NORMAL] || 0;
        comparison = bUrgency - aUrgency;
      } else {
        switch (sorting.sort_by) {
          case "product_name":
            comparison = a.product.name.localeCompare(b.product.name);
            break;
          case "quantity":
            comparison = a.quantity - b.quantity;
            break;
          case "expire_date":
            if (!a.expire_date && !b.expire_date) comparison = 0;
            else if (!a.expire_date) comparison = 1;
            else if (!b.expire_date) comparison = -1;
            else comparison = new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime();
            break;
          case "received_at":
            comparison = new Date(a.received_at).getTime() - new Date(b.received_at).getTime();
            break;
          case "batch_code":
            comparison = (a.batch_code || "").localeCompare(b.batch_code || "");
            break;
          case "wholesale_price":
            comparison = (a.wholesale_price || 0) - (b.wholesale_price || 0);
            break;
          case "suggested_price":
            comparison = (a.suggested_price || 0) - (b.suggested_price || 0);
            break;
        }

        if (sorting.sort_order === "desc") {
          comparison = -comparison;
        }

        if (comparison === 0) {
          const aUrgency = urgencyOrder[a.urgency_level || UrgencyLevel.NORMAL] || 0;
          const bUrgency = urgencyOrder[b.urgency_level || UrgencyLevel.NORMAL] || 0;
          comparison = bUrgency - aUrgency;
        }
      }

      return comparison;
    });

    set({ filteredItems: filtered });
  },

  fetchItems: async (skip = 0, limit?: number) => {
    set({ isLoadingItems: true, error: null });
    try {
      const filters = get().filters;
      const response = await warehouseApi.getItems({
        skip,
        limit,
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
      
      get().applyFiltersAndSorting();
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

  toggleItemSelection: (itemSid: string) => {
    set((state) => {
      const newSelected = new Set(state.selectedItems);
      if (newSelected.has(itemSid)) {
        newSelected.delete(itemSid);
      } else {
        newSelected.add(itemSid);
      }
      return { selectedItems: newSelected };
    });
  },

  selectAll: () => {
    const { filteredItems } = get();
    set({ selectedItems: new Set(filteredItems.map(item => item.sid)) });
  },

  clearSelection: () => {
    set({ selectedItems: new Set() });
  },

  deleteSelectedItems: async () => {
    const { selectedItems } = get();
    if (selectedItems.size === 0) return;
    
    await get().deleteItems(Array.from(selectedItems));
    set({ selectedItems: new Set() });
  },
}));