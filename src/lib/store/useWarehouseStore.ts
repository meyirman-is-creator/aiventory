import { create } from "zustand";

export type WarehouseItem = {
  itemId: number;
  name: string;
  category: string;
  quantity: number;
  expireDate: string;
  fileId: number;
  fileName: string;
};

export type WarehouseFile = {
  id: number;
  fileName: string;
  uploadedAt: string;
  itemsCount: number;
};

type WarehouseState = {
  files: WarehouseFile[];
  items: WarehouseItem[];
  selectedFileId: number | null;
  loading: boolean;
  error: string | null;
  setFiles: (files: WarehouseFile[]) => void;
  setItems: (items: WarehouseItem[]) => void;
  setSelectedFileId: (fileId: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addFile: (file: WarehouseFile) => void;
  removeItem: (itemId: number) => void;
  updateItemQuantity: (itemId: number, quantity: number) => void;
};

export const useWarehouseStore = create<WarehouseState>((set) => ({
  files: [],
  items: [],
  selectedFileId: null,
  loading: false,
  error: null,
  setFiles: (files) => set({ files }),
  setItems: (items) => set({ items }),
  setSelectedFileId: (selectedFileId) => set({ selectedFileId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.itemId !== itemId),
    })),
  updateItemQuantity: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.itemId === itemId ? { ...item, quantity } : item
      ),
    })),
}));
