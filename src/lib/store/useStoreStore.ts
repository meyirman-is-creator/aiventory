import { create } from "zustand";

export type StoreItem = {
  storeItemId: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount: number;
  expireDate: string;
  isExpired: boolean;
};

type StoreState = {
  storeItems: StoreItem[];
  expiredItems: StoreItem[];
  loading: boolean;
  error: string | null;
  setStoreItems: (items: StoreItem[]) => void;
  setExpiredItems: (items: StoreItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applyDiscount: (itemId: number, discount: number) => void;
  moveToExpired: (itemId: number) => void;
  removeExpiredItem: (itemId: number) => void;
};

export const useStoreStore = create<StoreState>((set) => ({
  storeItems: [],
  expiredItems: [],
  loading: false,
  error: null,
  setStoreItems: (storeItems) => set({ storeItems }),
  setExpiredItems: (expiredItems) => set({ expiredItems }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  applyDiscount: (itemId, discount) =>
    set((state) => ({
      storeItems: state.storeItems.map((item) =>
        item.storeItemId === itemId
          ? {
              ...item,
              discount,
              price: item.originalPrice * (1 - discount / 100),
            }
          : item
      ),
    })),
  moveToExpired: (itemId) =>
    set((state) => {
      const itemToMove = state.storeItems.find(
        (item) => item.storeItemId === itemId
      );
      if (!itemToMove) return state;

      return {
        storeItems: state.storeItems.filter(
          (item) => item.storeItemId !== itemId
        ),
        expiredItems: [
          ...state.expiredItems,
          { ...itemToMove, isExpired: true },
        ],
      };
    }),
  removeExpiredItem: (itemId) =>
    set((state) => ({
      expiredItems: state.expiredItems.filter(
        (item) => item.storeItemId !== itemId
      ),
    })),
}));
