"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats, StoreReports } from "@/lib/types";
import { ResponsivePie } from "@nivo/pie";
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
      <Card className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-xs sm:text-sm">Загрузка аналитики...</p>
        </CardContent>
      </Card>
    );
  }

  const salesData = reports?.sales || [];

  const categoryDistributionData = stats?.category_distribution?.map(item => ({
    id: item.name,
    label: item.name,
    value: item.value,
    productCount: item.product_count
  })) || [];

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

  const last7Days = salesData.slice(-7);
  const currentWeekRevenue = last7Days.reduce((sum, sale) => sum + sale.revenue, 0);
  const previousWeekRevenue = salesData.slice(-14, -7).reduce((sum, sale) => sum + sale.revenue, 0);
  const revenueTrend = calculateTrend(currentWeekRevenue, previousWeekRevenue);

  const totalQuantity = categoryDistributionData.reduce((sum, item) => sum + item.value, 0);

  const pieColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

  return (
    <Card className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0 p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base md:text-lg">Аналитика продаж</CardTitle>
          <div className="flex items-center text-[10px] sm:text-xs md:text-sm">
            {revenueTrend.trend === 'up' && (
              <>
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-500 mr-0.5 sm:mr-1" />
                <span className="text-green-600">+{revenueTrend.value.toFixed(1)}%</span>
              </>
            )}
            {revenueTrend.trend === 'down' && (
              <>
                <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-red-500 mr-0.5 sm:mr-1" />
                <span className="text-red-600">-{revenueTrend.value.toFixed(1)}%</span>
              </>
            )}
            {revenueTrend.trend === 'neutral' && (
              <>
                <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-gray-500 mr-0.5 sm:mr-1" />
                <span className="text-gray-600">0%</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-3 sm:p-4 md:p-6 pt-0">
        <Tabs defaultValue="distribution" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-2 sm:mb-3 md:mb-4">
            <TabsTrigger value="distribution" className="text-[10px] sm:text-xs md:text-sm">Категории</TabsTrigger>
            <TabsTrigger value="categories" className="text-[10px] sm:text-xs md:text-sm">Топ по выручке</TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution" className="flex-grow">
            {categoryDistributionData.length > 0 ? (
              <div className="h-full relative">
                <ResponsivePie
                  data={categoryDistributionData}
                  margin={{ 
                    top: 10, 
                    right: window.innerWidth < 640 ? 10 : window.innerWidth < 768 ? 140 : 160,
                    bottom: 10, 
                    left: 10 
                  }}
                  innerRadius={0.6}
                  padAngle={2}
                  cornerRadius={4}
                  activeOuterRadiusOffset={8}
                  colors={pieColors}
                  borderWidth={2}
                  borderColor={{ theme: 'background' }}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={20}
                  arcLabelsTextColor="#ffffff"
                  arcLabel={d => `${((d.value / totalQuantity) * 100).toFixed(0)}%`}
                  tooltip={({ datum }) => (
                    <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                      <div className="font-semibold text-xs sm:text-sm">{datum.label}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600">
                        Количество: {datum.value.toLocaleString()} шт
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600">
                        Продуктов: {datum.data.productCount}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 font-medium">
                        {((datum.value / totalQuantity) * 100).toFixed(1)}% от общего
                      </div>
                    </div>
                  )}
                  legends={window.innerWidth > 640 ? [
                    {
                      anchor: 'right',
                      direction: 'column',
                      justify: false,
                      translateX: window.innerWidth < 768 ? 130 : 150,
                      translateY: 0,
                      itemsSpacing: window.innerWidth < 768 ? 4 : 6,
                      itemWidth: window.innerWidth < 768 ? 120 : 140,
                      itemHeight: window.innerWidth < 768 ? 18 : 20,
                      itemTextColor: '#666',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: window.innerWidth < 768 ? 10 : 12,
                      symbolShape: 'circle'
                    }
                  ] : []}
                />
                <div className={`absolute top-1/2 ${window.innerWidth < 640 ? 'left-1/2' : 'left-[40%]'} transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none`}>
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                    {totalQuantity.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">единиц</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-xs sm:text-sm">Нет данных для отображения</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="flex-grow overflow-y-auto">
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700">Топ-5 категорий по выручке</h4>
              {categoryData.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium truncate max-w-[60%]">{category.category}</span>
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                      {formatCurrency(category.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(category.revenue / categoryData[0]?.revenue) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">
                    {category.quantity} единиц продано
                  </p>
                </div>
              ))}
              {categoryData.length === 0 && (
                <div className="text-center text-gray-500 py-4 sm:py-6 md:py-8">
                  <p className="text-xs sm:text-sm">Нет данных по категориям</p>
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