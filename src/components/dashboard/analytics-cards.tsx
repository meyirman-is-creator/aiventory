"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats, StoreReports } from "@/lib/types";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalyticsCardsProps {
  stats: DashboardStats | null;
  reports: StoreReports | null;
  isLoading: boolean;
}

interface CategoryData {
  category: string;
  revenue: number;
  quantity: number;
}

const AnalyticsCards = ({ reports, isLoading }: Omit<AnalyticsCardsProps, 'stats'>) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Загрузка аналитики...</p>
        </CardContent>
      </Card>
    );
  }

  const salesData = reports?.sales || [];
  const last7Days = salesData.slice(-7);

  const lineData = [
    {
      id: "Выручка",
      color: "#6322FE",
      data: last7Days.map(sale => ({
        x: new Date(sale.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        y: sale.revenue
      }))
    }
  ];

  const barData = last7Days.map(sale => ({
    date: new Date(sale.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    quantity: sale.quantity
  }));

  const categoryData = reports?.sales
    ?.reduce((acc: CategoryData[], sale) => {
      const category = acc.find(c => c.category === sale.category_name);
      if (category) {
        category.revenue += sale.revenue;
        category.quantity += sale.quantity;
      } else {
        acc.push({
          category: sale.category_name,
          revenue: sale.revenue,
          quantity: sale.quantity
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) || [];

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, trend: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral'
    };
  };

  const currentWeekRevenue = last7Days.reduce((sum, sale) => sum + sale.revenue, 0);
  const previousWeekRevenue = salesData.slice(-14, -7).reduce((sum, sale) => sum + sale.revenue, 0);
  const revenueTrend = calculateTrend(currentWeekRevenue, previousWeekRevenue);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Аналитика продаж</CardTitle>
          <div className="flex items-center text-sm">
            {revenueTrend.trend === 'up' && (
              <>
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+{revenueTrend.value.toFixed(1)}%</span>
              </>
            )}
            {revenueTrend.trend === 'down' && (
              <>
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">-{revenueTrend.value.toFixed(1)}%</span>
              </>
            )}
            {revenueTrend.trend === 'neutral' && (
              <>
                <Minus className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-600">0%</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)]">
        <Tabs defaultValue="revenue" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Выручка</TabsTrigger>
            <TabsTrigger value="quantity">Количество</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="h-[calc(100%-3rem)]">
            {lineData[0].data.length > 0 ? (
              <ResponsiveLine
                data={lineData}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                curve="cardinal"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: value => `${(value / 1000).toFixed(0)}k`
                }}
                pointSize={8}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
                animate={true}
                motionConfig="gentle"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Нет данных для отображения
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quantity" className="h-[calc(100%-3rem)]">
            {barData.length > 0 ? (
              <ResponsiveBar
                data={barData}
                keys={['quantity']}
                indexBy="date"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                colors={['#6322FE']}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                animate={true}
                motionConfig="gentle"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Нет данных для отображения
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="h-[calc(100%-3rem)]">
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(category.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(category.revenue / categoryData[0]?.revenue) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {category.quantity} единиц продано
                  </p>
                </div>
              ))}
              {categoryData.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Нет данных по категориям
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCards;