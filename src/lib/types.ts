export interface User {
  sid: string;
  email: string;
  is_verified: boolean;
  role: "owner" | "admin" | "manager";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Category {
  sid: string;
  name: string;
}

export interface Product {
  sid: string;
  name: string;
  category_sid: string;
  barcode?: string;
  default_unit?: string;
  default_price?: number;
  currency?: string;
  storage_duration?: number;
  storage_duration_type?: string;
  category?: Category;
}

export enum WarehouseItemStatus {
  IN_STOCK = "in_stock",
  MOVED = "moved",
  DISCARDED = "discarded",
}

export enum UrgencyLevel {
  NORMAL = "normal",
  URGENT = "urgent",
  CRITICAL = "critical",
}

export interface DiscountSuggestion {
  discount_percent: number;
  discounted_price: number;
  days_until_expiry: number;
  urgency: string;
  shelf_life_remaining: number;
  reason: string;
  profit_margin: number;
  calculation_details?: {
    base_price: number;
    store_price: number;
    initial_markup: number;
    suggested_discount: number;
    discounted_price: number;
    final_profit_margin: number;
    min_acceptable_price: number;
  };
  recommendation: string;
}

export interface WarehouseAction {
  action: string;
  urgency: string;
  discount_suggestion?: number;
  reason: string;
  days_until_expiry?: number;
  shelf_life_remaining?: number;
  recommendation?: string;
}

export interface WarehouseItem {
  sid: string;
  upload_sid: string;
  product_sid: string;
  batch_code?: string;
  quantity: number;
  expire_date?: string;
  received_at: string;
  status: WarehouseItemStatus;
  product: Product;
  suggested_price?: number;
  wholesale_price?: number;
  discount_suggestion?: DiscountSuggestion;
  warehouse_action?: WarehouseAction;
  urgency_level?: UrgencyLevel;
  is_expired?: boolean;
}

export enum StoreItemStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REMOVED = "removed",
}

export interface Discount {
  sid: string;
  store_item_sid: string;
  percentage: number;
  starts_at: string;
  ends_at: string;
  created_by_sid: string;
}

export interface StoreItem {
  sid: string;
  warehouse_item_sid: string;
  quantity: number;
  price: number;
  moved_at: string;
  status: StoreItemStatus;
  product: Product;
  expire_date?: string;
  current_discounts: Discount[];
  batch_code?: string;
  days_until_expiry?: number;
}

export interface CartItem {
  sid: string;
  product: Product;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  expire_date?: string;
}

export interface RemovedItem extends StoreItem {
  removed_at: string;
  lost_value: number;
  removal_reason: string;
}

export interface Sale {
  sid: string;
  store_item_sid: string;
  sold_qty: number;
  sold_price: number;
  sold_at: string;
  cashier_sid: string;
  product?: Product;
  total_amount?: number;
}

export interface Upload {
  sid: string;
  file_name: string;
  uploaded_at: string;
  rows_imported: number;
  items_updated?: number;
  new_items_created?: number;
  updated_items?: Array<{
    product_name: string;
    barcode: string;
    batch_code: string;
    previous_quantity: number;
    added_quantity: number;
    new_total_quantity: number;
    message: string;
  }>;
}

export enum TimeFrame {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export interface Prediction {
  sid: string;
  product_sid: string;
  timeframe: TimeFrame;
  period_start: string;
  period_end: string;
  forecast_qty: number;
  generated_at: string;
  model_version: string;
  product?: Product;
  forecast_qty_lower?: number;
  forecast_qty_upper?: number;
}

export interface DashboardStats {
  total_products: number;
  products_in_warehouse: number;
  products_in_store: number;
  products_expiring_soon: number;
  total_revenue_last_30_days: number;
  total_sales_last_30_days: number;
  revenue_change: number;
  sales_change: number;
  avg_check: number;
  avg_check_change: number;
  conversion_rate: number;
  conversion_change: number;
  warehouse_change?: number;
  store_items_change?: number;
  category_distribution: Array<{
    name: string;
    value: number;
    product_count: number;
  }>;
  top_products: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface StoreReports {
  period: {
    start_date: string;
    end_date: string;
  };
  sales: Array<{
    date: string;
    product_name: string;
    category_name: string;
    quantity: number;
    revenue: number;
  }>;
  discounts: Array<{
    product_name: string;
    category_name: string;
    discount_percentage: number;
    start_date: string;
    end_date: string;
    sales_count: number;
    sold_quantity: number;
    discounted_revenue: number;
    regular_revenue: number;
    savings: number;
  }>;
  removed: Array<{
    product_name: string;
    category_name: string;
    removed_quantity: number;
    removed_value: number;
    removed_items_count: number;
    removal_reason: string;
  }>;
  summary: {
    total_sales: number;
    total_items_sold: number;
    total_removed_value: number;
    total_removed_items: number;
    total_discount_savings: number;
  };
}

export interface PredictionStats {
  dates: string[];
  products: Array<{ product_sid: string; product_name: string }>;
  categories?: Array<{ category_sid: string; category_name: string }>;
  quantity_data: Record<string, unknown>[];
  revenue_data: Record<string, unknown>[];
  category_quantity_data?: Record<string, unknown>[];
  category_revenue_data?: Record<string, unknown>[];
}

export interface WarehouseItemsResponse {
  items: WarehouseItem[];
  total: number;
  skip: number;
  limit: number | null;
  categories: Array<{ sid: string; name: string }>;
}

export interface WarehouseFilters {
  search?: string;
  category_sid?: string;
  status?: WarehouseItemStatus;
  urgency_level?: UrgencyLevel;
  expire_soon?: boolean;
  expired?: boolean;
}

export interface WarehouseSorting {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export type ProductResponse = Product;
export type ProductCategory = Category;