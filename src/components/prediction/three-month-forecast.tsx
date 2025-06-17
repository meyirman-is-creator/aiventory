"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Loader2, TrendingUp, Calendar, Package, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { predictionApi } from "@/lib/api";
import { format, parseISO } from "date-fns";

interface ThreeMonthForecastProps {
  productSid: string;
  productName: string;
}

const ThreeMonthForecast = ({ productSid, productName }: ThreeMonthForecastProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null);
  const [brushStartIndex, setBrushStartIndex] = useState(0);
  const [brushEndIndex, setBrushEndIndex] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [productSid]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await predictionApi.getProductAnalytics(productSid);
      setAnalytics(response);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-gray-500">Нет данных для анализа</p>
      </div>
    );
  }

  // Подготовка данных для графика
  const prepareChartData = () => {
    const historicalData = analytics.sales_history.dates.map((date: string, idx: number) => ({
      date: date,
      value: analytics.sales_history.quantities[idx],
      type: "historical",
      displayDate: format(parseISO(date), "dd.MM.yyyy"),
    }));

    const forecastData = analytics.forecast_90_days.map((f: any) => ({
      date: f.date,
      value: f.forecast_qty,
      lowerBound: f.forecast_qty_lower,
      upperBound: f.forecast_qty_upper,
      type: "forecast",
      displayDate: format(parseISO(f.date), "dd.MM.yyyy"),
    }));

    return [...historicalData, ...forecastData];
  };

  const aggregateByPeriod = (data: any[], period: "weekly" | "monthly") => {
    if (period === "weekly") {
      const weeks: { [key: string]: { sum: number; count: number; dates: string[] } } = {};
      
      data.forEach((item) => {
        const date = parseISO(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = format(weekStart, "yyyy-MM-dd");
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = { sum: 0, count: 0, dates: [] };
        }
        
        weeks[weekKey].sum += item.value;
        weeks[weekKey].count += 1;
        weeks[weekKey].dates.push(item.date);
      });

      return Object.entries(weeks).map(([weekStart, data]) => ({
        date: weekStart,
        value: Math.round(data.sum),
        type: "aggregated",
        displayDate: `Неделя ${format(parseISO(weekStart), "dd.MM")}`,
        tooltip: `${data.count} дней`,
      }));
    } else {
      const months: { [key: string]: { sum: number; count: number } } = {};
      
      data.forEach((item) => {
        const date = parseISO(item.date);
        const monthKey = format(date, "yyyy-MM");
        
        if (!months[monthKey]) {
          months[monthKey] = { sum: 0, count: 0 };
        }
        
        months[monthKey].sum += item.value;
        months[monthKey].count += 1;
      });

      return Object.entries(months).map(([month, data]) => ({
        date: `${month}-01`,
        value: Math.round(data.sum),
        type: "aggregated",
        displayDate: format(parseISO(`${month}-01`), "MMM yyyy"),
        tooltip: `${data.count} дней`,
      }));
    }
  };

  const getViewData = () => {
    const chartData = prepareChartData();
    
    if (viewMode === "daily") {
      return chartData;
    } else {
      return aggregateByPeriod(chartData, viewMode);
    }
  };

  const handleZoomIn = () => {
    const data = getViewData();
    const currentRange = brushEndIndex - brushStartIndex;
    const newRange = Math.max(7, Math.floor(currentRange * 0.7));
    const center = Math.floor((brushStartIndex + brushEndIndex) / 2);
    const newStart = Math.max(0, center - Math.floor(newRange / 2));
    const newEnd = Math.min(data.length - 1, newStart + newRange);
    
    setBrushStartIndex(newStart);
    setBrushEndIndex(newEnd);
  };

  const handleZoomOut = () => {
    const data = getViewData();
    const currentRange = brushEndIndex - brushStartIndex;
    const newRange = Math.min(data.length, Math.floor(currentRange * 1.5));
    const center = Math.floor((brushStartIndex + brushEndIndex) / 2);
    const newStart = Math.max(0, center - Math.floor(newRange / 2));
    const newEnd = Math.min(data.length - 1, newStart + newRange);
    
    setBrushStartIndex(newStart);
    setBrushEndIndex(newEnd);
  };

  const handleResetZoom = () => {
    const data = getViewData();
    setBrushStartIndex(0);
    setBrushEndIndex(Math.min(30, data.length - 1));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.displayDate}</p>
          <p className="text-sm">
            Количество: <span className="font-bold">{Math.round(payload[0].value)}</span> ед.
          </p>
          {data.type === "forecast" && data.lowerBound && data.upperBound && (
            <p className="text-xs text-gray-500">
              Диапазон: {Math.round(data.lowerBound)} - {Math.round(data.upperBound)}
            </p>
          )}
          {data.tooltip && (
            <p className="text-xs text-gray-500">{data.tooltip}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const data = getViewData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Текущий запас
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.current_inventory.total} ед.
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Склад: {analytics.current_inventory.warehouse} | Магазин: {analytics.current_inventory.store}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Прогноз на 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(analytics.forecast_summary.next_7_days)} ед.
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ~{Math.round(analytics.forecast_summary.next_7_days / 7)} ед/день
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Прогноз на 30 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analytics.forecast_summary.next_30_days)} ед.
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ~{Math.round(analytics.forecast_summary.next_30_days / 30)} ед/день
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Прогноз на 90 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(analytics.forecast_summary.next_90_days)} ед.
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ~{Math.round(analytics.forecast_summary.next_90_days / 90)} ед/день
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Прогноз продаж: {productName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetZoom}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList>
                  <TabsTrigger value="daily">По дням</TabsTrigger>
                  <TabsTrigger value="weekly">По неделям</TabsTrigger>
                  <TabsTrigger value="monthly">По месяцам</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="displayDate"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={viewMode === "daily" ? Math.floor(data.length / 10) : 0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{
                    value: "Количество (ед.)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="line"
                  wrapperStyle={{ fontSize: "12px" }}
                />

                {/* Область неопределенности для прогноза */}
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                {/* Исторические данные */}
                <Line
                  type="monotone"
                  dataKey={(item: any) => (item.type === "historical" ? item.value : null)}
                  stroke="#6322FE"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="История продаж"
                  connectNulls={false}
                />

                {/* Прогнозные данные */}
                <Line
                  type="monotone"
                  dataKey={(item: any) => (item.type === "forecast" ? item.value : null)}
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Прогноз"
                  connectNulls={false}
                />

                {/* Диапазон прогноза */}
                {viewMode === "daily" && (
                  <>
                    <Area
                      type="monotone"
                      dataKey={(item: any) => (item.type === "forecast" ? item.upperBound : null)}
                      stroke="none"
                      fill="url(#colorForecast)"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey={(item: any) => (item.type === "forecast" ? item.lowerBound : null)}
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={1}
                    />
                  </>
                )}

                {/* Текущая дата */}
                <ReferenceLine
                  x={format(new Date(), "dd.MM.yyyy")}
                  stroke="#ff0000"
                  strokeDasharray="3 3"
                  label={{ value: "Сегодня", position: "top" }}
                />

                {/* Интерактивная область выбора */}
                <Brush
                  dataKey="displayDate"
                  height={30}
                  stroke="#6322FE"
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                  onChange={(e: any) => {
                    if (e.startIndex !== undefined && e.endIndex !== undefined) {
                      setBrushStartIndex(e.startIndex);
                      setBrushEndIndex(e.endIndex);
                    }
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Статистика продаж (90 дней)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Всего продано:</span>
                <span className="font-semibold">
                  {Math.round(analytics.sales_statistics.total_quantity)} ед.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Общая выручка:</span>
                <span className="font-semibold">
                  {formatCurrency(analytics.sales_statistics.total_revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Средние продажи в день:</span>
                <span className="font-semibold">
                  {analytics.sales_statistics.avg_daily_quantity.toFixed(1)} ед.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Дней с продажами:</span>
                <span className="font-semibold">
                  {analytics.sales_statistics.sale_days}
                </span>
              </div>
              {analytics.sales_statistics.last_sale_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Последняя продажа:</span>
                  <span className="font-semibold">
                    {format(parseISO(analytics.sales_statistics.last_sale_date), "dd.MM.yyyy")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Рекомендации по закупкам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.current_inventory.total < analytics.forecast_summary.next_7_days && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Критично!</strong> Текущих запасов недостаточно даже на неделю.
                    Необходима срочная закупка минимум{" "}
                    {Math.round(
                      analytics.forecast_summary.next_30_days - analytics.current_inventory.total
                    )}{" "}
                    единиц.
                  </p>
                </div>
              )}

              {analytics.current_inventory.total >= analytics.forecast_summary.next_7_days &&
                analytics.current_inventory.total < analytics.forecast_summary.next_30_days && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Внимание!</strong> Запасов хватит на{" "}
                      {Math.round(
                        analytics.current_inventory.total /
                          (analytics.forecast_summary.next_30_days / 30)
                      )}{" "}
                      дней. Рекомендуется закупить{" "}
                      {Math.round(
                        analytics.forecast_summary.next_30_days - analytics.current_inventory.total
                      )}{" "}
                      единиц.
                    </p>
                  </div>
                )}

              {analytics.current_inventory.total >= analytics.forecast_summary.next_30_days && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Хорошо!</strong> Текущих запасов достаточно на{" "}
                    {Math.round(
                      analytics.current_inventory.total /
                        (analytics.forecast_summary.next_90_days / 90)
                    )}{" "}
                    дней.
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Оптимальный заказ:</strong> Рекомендуется поддерживать запас на 45-60
                  дней. Оптимальное количество для заказа:{" "}
                  {Math.round(analytics.forecast_summary.next_30_days * 1.5)} единиц.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreeMonthForecast;