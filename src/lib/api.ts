import axios from 'axios';
import { 
  StoreItem, 
  Sale, 
  Category,
  Product,
  StoreReports,
  RemovedItem,
  WarehouseItemStatus,
  UrgencyLevel
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    return response.data;
  },

  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  verify: async (email: string, code: string) => {
    const response = await api.post('/auth/verify', { email, code });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

interface WarehouseFilters {
  status?: WarehouseItemStatus;
  expire_soon?: boolean;
  urgency_level?: UrgencyLevel;
  search?: string;
  category_sid?: string;
  skip?: number;
  limit?: number | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const warehouseApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/warehouse/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getItems: async (filters?: WarehouseFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.expire_soon) params.append('expire_soon', 'true');
      if (filters.urgency_level) params.append('urgency_level', filters.urgency_level);
      if (filters.search) params.append('search', filters.search);
      if (filters.category_sid) params.append('category_sid', filters.category_sid);
      if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
      if (filters.limit !== undefined && filters.limit !== null) params.append('limit', filters.limit.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }
    
    const response = await api.get(`/warehouse/items?${params.toString()}`);
    return response.data;
  },

  moveToStore: async (itemSid: string, quantity: number, price?: number) => {
    const formData = new FormData();
    formData.append('item_sid', itemSid);
    formData.append('quantity', quantity.toString());
    if (price !== undefined) {
      formData.append('price', price.toString());
    }
    const response = await api.post('/warehouse/to-store', formData);
    return response.data;
  },

  moveToStoreByBarcode: async (barcode: string, quantity: number, price?: number) => {
    const formData = new FormData();
    formData.append('barcode', barcode);
    formData.append('quantity', quantity.toString());
    if (price !== undefined) {
      formData.append('price', price.toString());
    }
    const response = await api.post('/warehouse/to-store-by-barcode', formData);
    return response.data;
  },

  deleteItems: async (itemSids: string[]) => {
    const response = await api.delete('/warehouse/items', {
      data: { item_sids: itemSids }
    });
    return response.data;
  },
};

export const storeApi = {
  getItems: async (status?: string): Promise<StoreItem[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const response = await api.get(`/store/items?${params.toString()}`);
    return response.data;
  },

  getRemovedItems: async (): Promise<RemovedItem[]> => {
    const response = await api.get('/store/removed-items');
    return response.data;
  },

  recordSale: async (storeItemSid: string, soldQty: number, soldPrice: number) => {
    const response = await api.post('/store/sales', {
      store_item_sid: storeItemSid,
      sold_qty: soldQty,
      sold_price: soldPrice,
    });
    return response.data;
  },

  recordSaleByBarcode: async (barcode: string, soldQty: number) => {
    const response = await api.post(`/store/sales-by-barcode?barcode=${barcode}&sold_qty=${soldQty}`);
    return response.data;
  },

  getSales: async (startDate?: Date, endDate?: Date): Promise<Sale[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    const response = await api.get(`/store/sales?${params.toString()}`);
    return response.data;
  },

  createDiscount: async (storeItemSid: string, percentage: number, startsAt: Date, endsAt: Date) => {
    const response = await api.post('/store/discount', {
      store_item_sid: storeItemSid,
      percentage,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });
    return response.data;
  },

  markAsExpired: async (storeItemSid: string) => {
    const response = await api.post(`/store/expire/${storeItemSid}`);
    return response.data;
  },

  removeFromStore: async (storeItemSid: string) => {
    const response = await api.post(`/store/remove/${storeItemSid}`);
    return response.data;
  },

  getReports: async (startDate?: Date, endDate?: Date): Promise<StoreReports> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    const response = await api.get(`/store/reports?${params.toString()}`);
    return response.data;
  },
};

export const predictionApi = {
  getProducts: async (categorySid?: string, search?: string): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (categorySid) params.append('category_sid', categorySid);
    if (search) params.append('search', search);
    const response = await api.get(`/prediction/products?${params.toString()}`);
    return response.data;
  },

  getCategories: async (search?: string): Promise<Category[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const response = await api.get(`/prediction/categories?${params.toString()}`);
    return response.data;
  },

  getForecast: async (productSid: string, refresh?: boolean, timeframe?: string, periods?: number) => {
    const params = new URLSearchParams();
    if (refresh) params.append('refresh', 'true');
    if (timeframe) params.append('timeframe', timeframe);
    if (periods) params.append('periods', periods.toString());
    const response = await api.get(`/prediction/forecast/${productSid}?${params.toString()}`);
    return response.data;
  },

  getStats: async (productSid?: string, categorySid?: string, startDate?: Date, endDate?: Date, groupBy?: string) => {
    const params = new URLSearchParams();
    if (productSid) params.append('product_sid', productSid);
    if (categorySid) params.append('category_sid', categorySid);
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    if (groupBy) params.append('group_by', groupBy);
    const response = await api.get(`/prediction/stats?${params.toString()}`);
    return response.data;
  },

  getAnalytics: async (productSid: string) => {
    const response = await api.get(`/prediction/analytics/${productSid}`);
    return response.data;
  },

  getTrends: async (productSid: string, daysBack?: number) => {
    const params = new URLSearchParams();
    if (daysBack) params.append('days_back', daysBack.toString());
    const response = await api.get(`/prediction/trends/${productSid}?${params.toString()}`);
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/prediction/insights');
    return response.data;
  },

  getOptimizationSuggestions: async () => {
    const response = await api.get('/prediction/optimization-suggestions');
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};