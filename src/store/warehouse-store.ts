import { create } from "zustand";
import { warehouseApi } from "@/lib/api";
import { WarehouseItem, Upload, WarehouseItemStatus } from "@/lib/types";

interface WarehouseState {
  items: WarehouseItem[];
  expiringItems: WarehouseItem[];
  uploads: Upload[];
  isLoadingItems: boolean;
  isLoadingExpiringItems: boolean;
  isUploading: boolean;
  isMoving: boolean;
  error: string | null;
  lastFetchedItems: Date | null;
  lastFetchedExpiringItems: Date | null;
  fetchItems: () => Promise<void>;
  fetchExpiringItems: () => Promise<void>;
  uploadFile: (file: File) => Promise<Upload>;
  moveToStore: (
    itemSid: string,
    quantity: number,
    price: number
  ) => Promise<{ store_item_sid: string; message: string }>;
  moveToStoreByBarcode: (
    barcodeImage: string,
    quantity: number,
    price: number
  ) => Promise<{ store_item_sid: string; message: string }>;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  items: [],
  expiringItems: [],
  uploads: [],
  isLoadingItems: false,
  isLoadingExpiringItems: false,
  isUploading: false,
  isMoving: false,
  error: null,
  lastFetchedItems: null,
  lastFetchedExpiringItems: null,

  fetchItems: async () => {
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
      const items = await warehouseApi.getItems();
      set({
        items,
        isLoadingItems: false,
        lastFetchedItems: new Date(),
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

  fetchExpiringItems: async () => {
    const current = new Date();
    const lastFetched = get().lastFetchedExpiringItems;

    // If data was fetched in the last 5 minutes, don't fetch again
    if (
      lastFetched &&
      current.getTime() - lastFetched.getTime() < 5 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingExpiringItems: true, error: null });
    try {
      const expiringItems = await warehouseApi.getItems(true);
      set({
        expiringItems,
        isLoadingExpiringItems: false,
        lastFetchedExpiringItems: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to fetch expiring warehouse items";
      
      set({
        error: errorMessage,
        isLoadingExpiringItems: false,
      });
    }
  },

  uploadFile: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      const upload = await warehouseApi.uploadFile(file);

      // Refresh items after upload
      await get().fetchItems();

      set({
        uploads: [...get().uploads, upload],
        isUploading: false,
      });
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

      // Update the item in the items list
      const updatedItems = get().items.map((item) => {
        if (item.sid === itemSid) {
          // If all quantity is moved, change status
          if (item.quantity - quantity <= 0) {
            return {
              ...item,
              quantity: 0,
              status: WarehouseItemStatus.MOVED,
            };
          }

          return {
            ...item,
            quantity: item.quantity - quantity,
          };
        }
        return item;
      });

      set({
        items: updatedItems,
        isMoving: false,
      });

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

  moveToStoreByBarcode: async (
    barcode: string,
    quantity: number,
    price: number
  ) => {
    set({ isMoving: true, error: null });
    try {
      const formData = new FormData();
      formData.append("barcode", barcode);
      formData.append("quantity", quantity.toString());
      formData.append("price", price.toString());
  
      // In your real API, this would be sending the barcode value rather than an image
      const result = await warehouseApi.moveToStoreByBarcode(
        barcode,
        quantity,
        price
      );
  
      // Refresh warehouse items
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
}));
