import apiClient from "./apiClient";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post("/warehouse/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const getFiles = async () => {
  return apiClient.get("/warehouse/files");
};

export const getItems = async (fileId: number) => {
  return apiClient.get(`/warehouse/items/${fileId}`);
};

export const moveToStore = async (itemId: number, quantity: number) => {
  return apiClient.post("/warehouse/to-store", { itemId, quantity });
};
