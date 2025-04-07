import apiClient from "./apiClient";

export const getPrediction = async (itemId: number) => {
  return apiClient.get(`/prediction/${itemId}`);
};

export const getPredictionStats = async () => {
  return apiClient.get("/prediction/stats");
};

export const getPredictionRecommendations = async () => {
  return apiClient.get("/prediction/recommendations");
};
