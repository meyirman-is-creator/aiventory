"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { Loader2, TrendingUp, Calendar, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { predictionApi } from "@/lib/api";

interface ThreeMonthForecastProps {
  productSid: string;
  productName: string;
}

const ThreeMonthForecast = ({ productSid, productName }: ThreeMonthForecastProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");

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

  // Подготовка данных для графиков
  const prepareChartData = () => {
    const historicalData = analytics.sales_history.dates.map((date: string, idx: number) => ({
      x: date,
      y: analytics.sales_history.quantities[idx]
    }));

    const forecastData = analytics.forecast_90_days.map((f: any) => ({
      x: f.date,
      y: f.forecast_qty,
      yLower: f.forecast_qty_lower,
      yUpper: f.forecast_qty_upper
    }));

    return [
      {
        id: "История продаж",
        data: historicalData,
        color: "#6322FE"
      },
      {
        id: "Прогноз",
        data: forecastData,
        color: "#22C55E"
      }
    ];
  };

  const aggregateByPeriod = (data: any[], period: "weekly" | "monthly") => {
    if (period === "weekly") {
      // Группировка по неделям
      const weeks: { [key: string]: number } = {};
      data.forEach((item) => {
        const date = new Date(item.x);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeks[weekKey] = (weeks[weekKey] || 0) + item.y;
      });
      return Object.entries(weeks).map(([date, value]) => ({ x: date, y: value }));
    } else {
      // Группировка по месяцам
      const months: { [key: string]: number } = {};
      data.forEach((item) => {
        const date = new Date(item.x);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = (months[monthKey] || 0) + item.y;
      });
      return Object.entries(months).map(([date, value]) => ({ x: date + '-01', y: value }));
    }
  };

  const getViewData = () => {
    const chartData = prepareChartData();
    
    if (viewMode === "daily") {
      return chartData;
    } else {
      return chartData.map(series => ({
        ...series,
        data: aggregateByPeriod(series.data, viewMode)
      }));
    }
  };

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
              Прогноз продаж на 3 месяца: {productName}
            </CardTitle>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="daily">По дням</TabsTrigger>
                <TabsTrigger value="weekly">По неделям</TabsTrigger>
                <TabsTrigger value="monthly">По месяцам</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveLine
            data={getViewData()}
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisBottom={{
              tickRotation: -45,
              legend: viewMode === "daily" ? "Дата" : viewMode === "weekly" ? "Неделя" : "Месяц",
              legendPosition: "middle",
              legendOffset: 45
            }}
            axisLeft={{
              legend: "Количество",
              legendPosition: "middle",
              legendOffset: -50
            }}
            pointSize={6}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            useMesh={true}
            enableArea={true}
            areaOpacity={0.1}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle"
              }
            ]}
          />
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
                    Необходима срочная закупка минимум {Math.round(analytics.forecast_summary.next_30_days - analytics.current_inventory.total)} единиц.
                  </p>
                </div>
              )}
              
              {analytics.current_inventory.total >= analytics.forecast_summary.next_7_days && 
               analytics.current_inventory.total < analytics.forecast_summary.next_30_days && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Внимание!</strong> Запасов хватит на {Math.round(analytics.current_inventory.total / (analytics.forecast_summary.next_30_days / 30))} дней.
                    Рекомендуется закупить {Math.round(analytics.forecast_summary.next_30_days - analytics.current_inventory.total)} единиц.
                  </p>
                </div>
              )}
              
              {analytics.current_inventory.total >= analytics.forecast_summary.next_30_days && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Хорошо!</strong> Текущих запасов достаточно на {Math.round(analytics.current_inventory.total / (analytics.forecast_summary.next_90_days / 90))} дней.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreeMonthForecast;