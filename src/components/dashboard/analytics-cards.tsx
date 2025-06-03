"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats, StoreReports } from "@/lib/types";
import { ResponsivePie } from "@nivo/pie";
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

const AnalyticsCards = ({ stats, reports, isLoading }: AnalyticsCardsProps) => {
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

  // Данные для круговой диаграммы распределения по категориям
  const categoryDistributionData = stats?.category_distribution?.map(item => ({
    id: item.name,
    label: item.name,
    value: item.value,
    productCount: item.product_count
  })) || [];

  // Данные для гистограммы количества продаж
  const barData = last7Days.map(sale => ({
    date: new Date(sale.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    quantity: sale.quantity
  }));

  // Данные по категориям для третьей вкладки
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

  const totalQuantity = categoryDistributionData.reduce((sum, item) => sum + item.value, 0);

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
        <Tabs defaultValue="distribution" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distribution">Распределение по категориям</TabsTrigger>
            <TabsTrigger value="quantity">Количество продаж</TabsTrigger>
            <TabsTrigger value="categories">Топ категории</TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution" className="h-[calc(100%-3rem)]">
            {categoryDistributionData.length > 0 ? (
              <div className="h-full relative">
                <ResponsivePie
                  data={categoryDistributionData}
                  margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'nivo' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  tooltip={({ datum }) => (
                    <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                      <div className="font-semibold">{datum.label}</div>
                      <div className="text-sm text-gray-600">
                        Количество: {datum.value.toLocaleString()} шт
                      </div>
                      <div className="text-sm text-gray-600">
                        Продуктов: {datum.data.productCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((datum.value / totalQuantity) * 100).toFixed(1)}% от общего
                      </div>
                    </div>
                  )}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle'
                    }
                  ]}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-2xl font-bold text-gray-900">
                    {totalQuantity.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">единиц</div>
                </div>
              </div>
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
                  tickRotation: -45,
                  legend: 'Дата',
                  legendPosition: 'middle',
                  legendOffset: 40
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Количество продаж (шт)',
                  legendPosition: 'middle',
                  legendOffset: -50
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                animate={true}
                motionConfig="gentle"
                tooltip={({ data }) => (
                  <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                    <div className="font-semibold text-sm">{data.date}</div>
                    <div className="text-sm text-gray-600">
                      Продано: {data.quantity} шт
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Нет данных для отображения
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="h-[calc(100%-3rem)]">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Топ-5 категорий по выручке</h4>
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