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
  BarChart,
  Bar,
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
import { ProductCategory } from "@/lib/types";
import { predictionApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { RefreshCw, Package, TrendingUp, Layers } from "lucide-react";

interface CategoryData {
  products: string[];
  dates: string[];
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
}

interface CategoryStats {
  totalQuantity: number;
  totalProducts: number;
  topProducts: [string, number][];
  averagePerDay: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

interface CategorySalesChartProps {
  categories: ProductCategory[];
  selectedCategorySid: string | null;
  setSelectedCategorySid: (sid: string) => void;
  isLoadingCategories: boolean;
}

const generateProductColors = (count: number) => {
  const baseColors = [
    "#6322FE", "#22C55E", "#EF4444", "#F59E0B", "#3B82F6",
    "#8B5CF6", "#EC4899", "#10B981", "#F97316", "#06B6D4",
    "#6366F1", "#84CC16", "#A855F7", "#14B8A6", "#F43F5E"
  ];
  
  // Repeat colors if needed
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

export default function CategorySalesChart({
  categories,
  selectedCategorySid,
  setSelectedCategorySid,
  isLoadingCategories,
}: CategorySalesChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState<CategoryStats | null>(null);

  useEffect(() => {
    if (selectedCategorySid) {
      loadCategoryData(selectedCategorySid);
    }
  }, [selectedCategorySid]);

  const loadCategoryData = async (categorySid: string) => {
    setIsLoadingData(true);
    try {
      const data = await predictionApi.getCategorySales(categorySid);
      setCategoryData(data);

      // Calculate stats
      if (data?.data) {
        const productTotals: Record<string, number> = {};
        let totalQuantity = 0;

        data.data.forEach((dayData: { date: string; [key: string]: string | number }) => {
          Object.entries(dayData).forEach(([key, value]) => {
            if (key !== 'date' && key !== 'displayDate') {
              productTotals[key] = (productTotals[key] || 0) + (value as number);
              totalQuantity += value as number;
            }
          });
        });

        const topProducts = Object.entries(productTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        setStats({
          totalQuantity,
          totalProducts: data.products.length,
          topProducts,
          averagePerDay: totalQuantity / data.data.length,
        });
      }
    } catch (error) {
      console.error("Error loading category data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedCategorySid) {
      await loadCategoryData(selectedCategorySid);
    }
  };

  const prepareChartData = () => {
    if (!categoryData) return [];

    return categoryData.data.map((dayData) => {
      const formattedDate = format(parseISO(dayData.date), "dd.MM");
      return {
        ...dayData,
        displayDate: formattedDate,
      };
    });
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
      
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {sortedPayload.slice(0, 10).map((entry) => (
            <div key={entry.dataKey} className="flex justify-between items-center text-sm py-1">
              <span className="text-gray-600 mr-4 truncate max-w-[200px]">
                {entry.dataKey}:
              </span>
              <span className="font-bold" style={{ color: entry.color }}>
                {Math.round(entry.value)} ед.
              </span>
            </div>
          ))}
          {sortedPayload.length > 10 && (
            <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
              +{sortedPayload.length - 10} товаров
            </p>
          )}
          <p className="text-sm font-semibold mt-2 pt-2 border-t">
            Всего: {sortedPayload.reduce((sum, entry) => sum + entry.value, 0).toFixed(0)} ед.
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoadingCategories) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  const chartData = prepareChartData();
  const colors = generateProductColors(categoryData?.products?.length || 0);
  const selectedCategory = categories.find(c => c.sid === selectedCategorySid);

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedCategorySid || ""}
          onValueChange={setSelectedCategorySid}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.sid} value={category.sid}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoadingData}
          className="whitespace-nowrap"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && selectedCategory && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Всего продано</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mt-1">{Math.round(stats.totalQuantity)}</p>
            <p className="text-xs text-gray-500 mt-1">единиц</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Товаров</p>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-1">в категории</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Среднее в день</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mt-1">{stats.averagePerDay.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">единиц</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Лидер продаж</p>
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm font-bold mt-1 truncate">
              {stats.topProducts[0]?.[0] || '-'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.topProducts[0]?.[1] ? `${Math.round(stats.topProducts[0][1])} ед.` : ''}
            </p>
          </Card>
        </div>
      )}

      {/* Top Products List */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Топ-5 товаров категории</h3>
          <div className="space-y-2">
            {stats.topProducts.map(([product, quantity]: [string, number], index: number) => (
              <div key={product} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-none">
                    {product}
                  </span>
                </div>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round(quantity)} ед.
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card className="p-4">
        <div className="h-[400px] lg:h-[500px]">
          {isLoadingData ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                <p className="text-sm text-gray-600 mt-2">Загрузка данных...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Layers className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-4">Нет данных для отображения</p>
                <p className="text-sm text-gray-400 mt-1">
                  Выберите категорию для просмотра статистики
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="displayDate"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={Math.floor(chartData.length / 20)}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  label={{ 
                    value: 'Количество', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12, fill: '#6b7280' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    paddingTop: "10px",
                    fontSize: "12px",
                    maxHeight: "60px",
                    overflowY: "auto"
                  }}
                />
                {categoryData?.products?.slice(0, 10).map((product: string, index: number) => (
                  <Bar
                    key={product}
                    dataKey={product}
                    stackId="a"
                    fill={colors[index]}
                    name={product.length > 30 ? product.substring(0, 30) + "..." : product}
                  />
                ))}
                {chartData.length > 30 && (
                  <Brush
                    dataKey="displayDate"
                    height={30}
                    stroke="#6322FE"
                    startIndex={Math.max(0, chartData.length - 30)}
                    endIndex={chartData.length - 1}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {categoryData && categoryData.products.length > 10 && (
          <div className="mt-2 text-sm text-gray-500 text-center">
            Показаны топ-10 товаров из {categoryData.products.length}
          </div>
        )}
      </Card>
    </div>
  );
}