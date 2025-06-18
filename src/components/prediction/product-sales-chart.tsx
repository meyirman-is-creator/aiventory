"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProductResponse } from "@/lib/types";
import { predictionApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { RefreshCw, TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface ProductSalesChartProps {
  products: ProductResponse[];
  selectedProductSid: string | null;
  setSelectedProductSid: (sid: string) => void;
  isLoadingProducts: boolean;
}

interface SalesData {
  dates: string[];
  quantities: number[];
}

interface ForecastData {
  period_start: string;
  forecast_qty: number;
}

interface ChartDataPoint {
  date: string;
  historical: number | null;
  forecast: number | null;
  displayDate: string;
}

interface ProductStats {
  total: number;
  average: number;
  lastMonth: number;
  daysWithSales: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number | null;
    color: string;
    name: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

export default function ProductSalesChart({
  products,
  selectedProductSid,
  setSelectedProductSid,
  isLoadingProducts,
}: ProductSalesChartProps) {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState<ProductStats | null>(null);

  useEffect(() => {
    if (selectedProductSid) {
      loadSalesData(selectedProductSid);
    }
  }, [selectedProductSid]);

  const loadSalesData = async (productSid: string) => {
    setIsLoadingData(true);
    try {
      const [sales, forecast] = await Promise.all([
        predictionApi.getSalesHistory(productSid),
        predictionApi.getForecast(productSid),
      ]);
      setSalesData(sales);
      setForecastData(forecast);

      // Calculate stats
      if (sales?.quantities && sales.quantities.length > 0) {
        const totalQuantity = sales.quantities.reduce((sum: number, q: number) => sum + q, 0);
        const avgQuantity = totalQuantity / sales.quantities.length;
        const lastMonthQuantities = sales.quantities.slice(-30);
        const lastMonthTotal = lastMonthQuantities.reduce((sum: number, q: number) => sum + q, 0);
        
        setStats({
          total: totalQuantity,
          average: avgQuantity,
          lastMonth: lastMonthTotal,
          daysWithSales: sales.quantities.filter((q: number) => q > 0).length,
        });
      }
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedProductSid) {
      await loadSalesData(selectedProductSid);
    }
  };

  const prepareChartData = () => {
    if (!salesData) return [];

    const historicalData = salesData.dates.map((date: string, idx: number) => ({
      date,
      historical: salesData.quantities[idx],
      forecast: null,
      displayDate: format(parseISO(date), "dd.MM"),
    }));

    const forecastDataPoints = (forecastData || []).map((f: ForecastData) => ({
      date: f.period_start,
      historical: null,
      forecast: f.forecast_qty,
      displayDate: format(parseISO(f.period_start), "dd.MM"),
    }));

    return [...historicalData, ...forecastDataPoints];
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 sm:p-3 border rounded-lg shadow-lg text-xs sm:text-sm">
          <p className="font-semibold">{format(parseISO(data.date), "dd.MM.yyyy")}</p>
          {payload.map((entry) => (
            entry.value !== null && (
              <p key={entry.dataKey} className="mt-0.5 sm:mt-1" style={{ color: entry.color }}>
                {entry.name}: <span className="font-bold">{Math.round(entry.value)}</span> ед.
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoadingProducts) {
    return <Skeleton className="h-[400px] sm:h-[500px] lg:h-[600px] w-full" />;
  }

  const chartData = prepareChartData();
  const selectedProduct = products.find(p => p.sid === selectedProductSid);

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Product Selector */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
        <Select
          value={selectedProductSid || ""}
          onValueChange={setSelectedProductSid}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Выберите товар" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.sid} value={product.sid}>
                <div className="flex flex-col">
                  <span className="font-medium text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                    {product.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none">
                    {product.category?.name || "Без категории"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoadingData}
          className="whitespace-nowrap text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && selectedProduct && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Всего продано</p>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-1" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{Math.round(stats.total)}</p>
            <p className="text-xs text-gray-500 mt-0.5">единиц</p>
          </Card>
          
          <Card className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Среднее/день</p>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-1" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{stats.average.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-0.5">единиц</p>
          </Card>
          
          <Card className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600 truncate">За месяц</p>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-1" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{Math.round(stats.lastMonth)}</p>
            <p className="text-xs text-gray-500 mt-0.5">единиц</p>
          </Card>
          
          <Card className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Дней продаж</p>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-1" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{stats.daysWithSales}</p>
            <p className="text-xs text-gray-500 mt-0.5">из {salesData?.dates?.length || 0}</p>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card className="p-2 sm:p-3 lg:p-4">
        <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
          {isLoadingData ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 animate-spin mx-auto text-purple-600" />
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">Загрузка данных...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-300 mx-auto" />
                <p className="text-sm sm:text-base text-gray-500 mt-3 sm:mt-4">Нет данных для отображения</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                  Выберите товар для просмотра статистики
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ 
                  top: 5, 
                  right: 10, 
                  left: 10, 
                  bottom: 60 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="displayDate"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={Math.floor(chartData.length / (window.innerWidth < 640 ? 10 : 20))}
                  tick={{ fontSize: window.innerWidth < 640 ? 9 : 11, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fontSize: window.innerWidth < 640 ? 9 : 11, fill: '#6b7280' }}
                  label={{ 
                    value: 'Количество', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#6b7280' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: window.innerWidth < 640 ? '11px' : '13px' }}
                />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#6322FE"
                  strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                  dot={{ r: window.innerWidth < 640 ? 2 : 3 }}
                  activeDot={{ r: window.innerWidth < 640 ? 4 : 5 }}
                  name="Фактические продажи"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#22C55E"
                  strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                  strokeDasharray="5 5"
                  dot={{ r: window.innerWidth < 640 ? 2 : 3 }}
                  activeDot={{ r: window.innerWidth < 640 ? 4 : 5 }}
                  name="Прогноз"
                  connectNulls={false}
                />
                {chartData.length > 30 && (
                  <Brush
                    dataKey="displayDate"
                    height={window.innerWidth < 640 ? 20 : 30}
                    stroke="#6322FE"
                    startIndex={Math.max(0, chartData.length - 30)}
                    endIndex={chartData.length - 1}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}