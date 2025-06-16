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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductResponse } from "@/lib/types";
import { predictionApi } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProductSalesChartProps {
  products: ProductResponse[];
  selectedProductSid: string | null;
  setSelectedProductSid: (sid: string) => void;
  isLoadingProducts: boolean;
}

export default function ProductSalesChart({
  products,
  selectedProductSid,
  setSelectedProductSid,
  isLoadingProducts,
}: ProductSalesChartProps) {
  const [salesData, setSalesData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const chartData = {
    labels: [
      ...(salesData?.dates || []),
      ...(forecastData?.map((f: any) => f.period_start) || []),
    ],
    datasets: [
      {
        label: "Фактические продажи",
        data: [
          ...(salesData?.quantities || []),
          ...Array(forecastData?.length || 0).fill(null),
        ],
        borderColor: "rgb(99, 34, 254)",
        backgroundColor: "rgba(99, 34, 254, 0.1)",
        tension: 0.1,
      },
      {
        label: "Прогноз",
        data: [
          ...Array(salesData?.dates?.length || 0).fill(null),
          ...(forecastData?.map((f: any) => f.forecast_qty) || []),
        ],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
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
        text: "История продаж и прогноз",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Количество",
        },
      },
    },
  };

  if (isLoadingProducts) {
    return <Skeleton className="h-[500px]" />;
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedProductSid || ""}
        onValueChange={setSelectedProductSid}
      >
        <SelectTrigger>
          <SelectValue placeholder="Выберите товар" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.sid} value={product.sid}>
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card className="p-4">
        <div className="h-[400px]">
          {isLoadingData ? (
            <Skeleton className="h-full" />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </Card>
    </div>
  );
}