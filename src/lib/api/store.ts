import apiClient from "./apiClient";

export const getStoreItems = async () => {
  return apiClient.get("/store/items");
};

export const applyDiscount = async (
  storeItemId: number,
  discountPercentage: number
) => {
  return apiClient.post("/store/discount", { storeItemId, discountPercentage });
};

export const expireItem = async (storeItemId: number) => {
  return apiClient.post("/store/expire", { storeItemId });
};

export const removeItem = async (storeItemId: number) => {
  return apiClient.post("/store/remove", { storeItemId });
};
