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
import { ProductCategory } from "@/lib/types";
import { predictionApi } from "@/lib/api";
import { format, parseISO } from "date-fns";

interface CategoryData {
  products: string[];
  dates: string[];
  data: Array<Record<string, number>>;
}

interface CategorySalesChartProps {
  categories: ProductCategory[];
  selectedCategorySid: string | null;
  setSelectedCategorySid: (sid: string) => void;
  isLoadingCategories: boolean;
}

// Генерация цветов для продуктов
const generateProductColors = (count: number) => {
  const colors = [
    "#6322FE", "#22C55E", "#EF4444", "#F59E0B", "#3B82F6",
    "#8B5CF6", "#EC4899", "#10B981", "#F97316", "#06B6D4",
    "#6366F1", "#84CC16", "#A855F7", "#14B8A6", "#F43F5E"
  ];
  return colors.slice(0, count);
};

export default function CategorySalesChart({
  categories,
  selectedCategorySid,
  setSelectedCategorySid,
  isLoadingCategories,
}: CategorySalesChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
    } catch (error) {
      console.error("Error loading category data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const prepareChartData = () => {
    if (!categoryData) return [];

    return categoryData.data.map((dayData: any) => ({
      ...dayData,
      displayDate: format(parseISO(dayData.date), "dd.MM"),
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <p className="font-semibold mb-2">{label}</p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any) => (
              <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                {entry.dataKey}: <span className="font-bold">{Math.round(entry.value)}</span> ед.
              </p>
            ))}
          <p className="text-sm font-semibold mt-2 pt-2 border-t">
            Всего: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toFixed(0)} ед.
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoadingCategories) {
    return <Skeleton className="h-[500px]" />;
  }

  const chartData = prepareChartData();
  const colors = generateProductColors(categoryData?.products?.length || 0);

  return (
    <div className="space-y-4">
      <Select
        value={selectedCategorySid || ""}
        onValueChange={setSelectedCategorySid}
      >
        <SelectTrigger>
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

      <Card className="p-4">
        <div className="h-[500px]">
          {isLoadingData ? (
            <Skeleton className="h-full" />
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Нет данных для отображения
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayDate"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={Math.floor(chartData.length / 20)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Количество', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    paddingTop: "10px",
                    fontSize: "12px"
                  }}
                />
                {categoryData?.products?.slice(0, 10).map((product: string, index: number) => (
                  <Bar
                    key={product}
                    dataKey={product}
                    stackId="a"
                    fill={colors[index]}
                    name={product.length > 20 ? product.substring(0, 20) + "..." : product}
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