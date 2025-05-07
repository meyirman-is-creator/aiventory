import axios from "axios";
import {
  AuthResponse,
  User,
  WarehouseItem,
  StoreItem,
  Prediction,
  DashboardStats,
  PredictionStats,
  StoreReports,
  Upload,
  Sale,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post<AuthResponse>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  register: async (email: string, password: string): Promise<User> => {
    const response = await api.post<User>("/auth/register", {
      email,
      password,
    });
    return response.data;
  },

  verify: async (email: string, code: string): Promise<User> => {
    const response = await api.post<User>("/auth/verify", { email, code });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
  },
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const warehouseResponse = await api.get<WarehouseItem[]>(
      "/warehouse/items"
    );
    const storeResponse = await api.get<StoreItem[]>("/store/items");
    const reportsResponse = await api.get<StoreReports>("/store/reports");

    // Extract stats from various responses
    const total_products = [
      ...new Set([
        ...warehouseResponse.data.map((item) => item.product_sid),
        ...storeResponse.data.map((item) => item.product.sid),
      ]),
    ].length;

    const products_in_warehouse = warehouseResponse.data.length;
    const products_in_store = storeResponse.data.length;

    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const products_expiring_soon = [
      ...warehouseResponse.data.filter((item) => {
        if (!item.expire_date) return false;
        const expireDate = new Date(item.expire_date);
        return expireDate <= oneWeekLater && expireDate >= today;
      }),
      ...storeResponse.data.filter((item) => {
        if (!item.expire_date) return false;
        const expireDate = new Date(item.expire_date);
        return expireDate <= oneWeekLater && expireDate >= today;
      }),
    ].length;

    const total_revenue_last_30_days = reportsResponse.data.summary.total_sales;
    const total_sales_last_30_days =
      reportsResponse.data.summary.total_items_sold;

    return {
      total_products,
      products_in_warehouse,
      products_in_store,
      products_expiring_soon,
      total_revenue_last_30_days,
      total_sales_last_30_days,
    };
  },
};

// Warehouse endpoints
export const warehouseApi = {
  getItems: async (expireSoon?: boolean): Promise<WarehouseItem[]> => {
    const params = expireSoon ? { expire_soon: true } : {};
    const response = await api.get<WarehouseItem[]>("/warehouse/items", {
      params,
    });
    return response.data;
  },

  uploadFile: async (file: File): Promise<Upload> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<Upload>("/warehouse/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  moveToStore: async (
    itemSid: string,
    quantity: number,
    price: number
  ): Promise<{ store_item_sid: string; message: string }> => {
    const formData = new FormData();
    formData.append("item_sid", itemSid);
    formData.append("quantity", quantity.toString());
    formData.append("price", price.toString());

    const response = await api.post<{
      store_item_sid: string;
      message: string;
    }>("/warehouse/to-store", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  moveToStoreByBarcode: async (
    barcode: string,
    quantity: number,
    price: number
  ): Promise<{ store_item_sid: string; message: string }> => {
    const formData = new FormData();
    formData.append("barcode", barcode);
    formData.append("quantity", quantity.toString());
    formData.append("price", price.toString());
  
    const response = await api.post<{
      store_item_sid: string;
      message: string;
    }>("/warehouse/to-store-by-barcode", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};

// Store endpoints
export const storeApi = {
  getItems: async (status?: string): Promise<StoreItem[]> => {
    const params = status ? { status } : {};
    const response = await api.get<StoreItem[]>("/store/items", { params });
    return response.data;
  },

  createDiscount: async (
    storeItemSid: string,
    percentage: number,
    startsAt: Date,
    endsAt: Date
  ): Promise<Discount> => {
    const response = await api.post("/store/discount", {
      store_item_sid: storeItemSid,
      percentage,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });
    return response.data;
  },

  markAsExpired: async (storeItemSid: string): Promise<StoreItem> => {
    const response = await api.post<StoreItem>(`/store/expire/${storeItemSid}`);
    return response.data;
  },

  removeFromStore: async (storeItemSid: string): Promise<StoreItem> => {
    const response = await api.post<StoreItem>(`/store/remove/${storeItemSid}`);
    return response.data;
  },

  recordSale: async (
    storeItemSid: string,
    soldQty: number,
    soldPrice: number
  ): Promise<Sale> => {
    const response = await api.post<Sale>("/store/sales", {
      store_item_sid: storeItemSid,
      sold_qty: soldQty,
      sold_price: soldPrice,
    });
    return response.data;
  },

  getReports: async (
    startDate?: Date,
    endDate?: Date
  ): Promise<StoreReports> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate.toISOString();
    if (endDate) params.end_date = endDate.toISOString();

    const response = await api.get<StoreReports>("/store/reports", { params });
    return response.data;
  },
};

// Prediction endpoints
export const predictionApi = {
  getForecast: async (
    productSid: string,
    refresh?: boolean,
    timeframe?: string,
    periods?: number
  ): Promise<Prediction[]> => {
    const params: Record<string, string | boolean | number> = {};
    if (refresh !== undefined) params.refresh = refresh;
    if (timeframe) params.timeframe = timeframe;
    if (periods) params.periods = periods;

    const response = await api.get<Prediction[]>(
      `/prediction/forecast/${productSid}`,
      { params }
    );
    return response.data;
  },

  getStats: async (
    productSid?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PredictionStats> => {
    const params: Record<string, string> = {};
    if (productSid) params.product_sid = productSid;
    if (startDate) params.start_date = startDate.toISOString();
    if (endDate) params.end_date = endDate.toISOString();

    const response = await api.get<PredictionStats>("/prediction/stats", {
      params,
    });
    return response.data;
  },
};

export default api;
