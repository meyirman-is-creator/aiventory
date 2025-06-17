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
import { ProductResponse } from "@/lib/types";
import { predictionApi } from "@/lib/api";
import { format, parseISO } from "date-fns";

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

  const prepareChartData = () => {
    const historicalData = (salesData?.dates || []).map((date: string, idx: number) => ({
      date,
      historical: salesData.quantities[idx],
      forecast: null,
      displayDate: format(parseISO(date), "dd.MM"),
    }));

    const forecastDataPoints = (forecastData || []).map((f: any) => ({
      date: f.period_start,
      historical: null,
      forecast: f.forecast_qty,
      displayDate: format(parseISO(f.period_start), "dd.MM"),
    }));

    return [...historicalData, ...forecastDataPoints];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{format(parseISO(data.date), "dd.MM.yyyy")}</p>
          {payload.map((entry: any) => (
            entry.value !== null && (
              <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
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
    return <Skeleton className="h-[500px]" />;
  }

  const chartData = prepareChartData();

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
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Нет данных для отображения
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayDate"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={Math.floor(chartData.length / 15)}
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
                />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#6322FE"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Фактические продажи"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  name="Прогноз"
                  connectNulls={false}
                />
                {chartData.length > 30 && (
                  <Brush
                    dataKey="displayDate"
                    height={30}
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