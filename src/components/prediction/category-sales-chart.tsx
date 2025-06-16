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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCategory } from "@/lib/types";
import { predictionApi } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  const chartData = {
    labels: categoryData?.dates || [],
    datasets:
      categoryData?.products?.map((product: string, index: number) => ({
        label: product,
        data: categoryData.data.map((d: Record<string, number>) => d[product] || 0),
        backgroundColor: `hsl(${index * 30}, 70%, 50%)`,
        borderColor: `hsl(${index * 30}, 70%, 40%)`,
        borderWidth: 1,
      })) || [],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Распределение продаж по товарам в категории",
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Количество",
        },
      },
    },
  };

  if (isLoadingCategories) {
    return <Skeleton className="h-[500px]" />;
  }

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
        <div className="h-[400px]">
          {isLoadingData ? (
            <Skeleton className="h-full" />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </Card>
    </div>
  );
}