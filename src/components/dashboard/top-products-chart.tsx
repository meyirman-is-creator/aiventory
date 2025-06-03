"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Package, DollarSign } from "lucide-react";

interface TopProductsChartProps {
  data: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
  isLoading: boolean;
}

const TopProductsChart = ({ data, isLoading }: TopProductsChartProps) => {
  if (isLoading) {
    return (
      <Card className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-xs sm:text-sm">Загрузка топ-10 товаров...</p>
        </CardContent>
      </Card>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 768;

  const chartData = data.slice(0, 10).map(item => ({
    product: item.name.length > (isMobile ? 8 : isTablet ? 10 : 12) ?
      item.name.substring(0, isMobile ? 8 : isTablet ? 10 : 12) + '...' :
      item.name,
    fullName: item.name,
    quantity: item.quantity,
    revenue: item.revenue,
    category: item.category
  }));

  const CustomTooltip = ({ data: tooltipData }: { data: { fullName: string; quantity: number; revenue: number; category: string } }) => {
    return (
      <div className="bg-white p-2 sm:p-3 rounded shadow-lg border border-gray-200">
        <p className="font-semibold text-xs sm:text-sm">{tooltipData.fullName}</p>
        <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">{tooltipData.category}</p>
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <span className="text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
              <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Продано:
            </span>
            <span className="text-[10px] sm:text-xs font-medium">{tooltipData.quantity} шт</span>
          </div>
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <span className="text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
              <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Выручка:
            </span>
            <span className="text-[10px] sm:text-xs font-medium">{formatCurrency(tooltipData.revenue)}</span>
          </div>
        </div>
      </div>
    );
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgQuantity = data.length > 0 ? data.reduce((sum, item) => sum + item.quantity, 0) / data.length : 0;

  return (
    <Card className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0 p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base md:text-lg">Топ-10 товаров по продажам</CardTitle>
          <div className="flex items-center text-[10px] sm:text-xs md:text-sm text-gray-600">
            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-500 mr-0.5 sm:mr-1" />
            <span>За 30 дней</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
          <div className="bg-gray-50 p-1.5 sm:p-2 md:p-3 rounded-lg">
            <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600">Общая выручка</p>
            <p className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-gray-50 p-1.5 sm:p-2 md:p-3 rounded-lg">
            <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600">Средние продажи</p>
            <p className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900">{Math.round(avgQuantity)} шт</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-3 sm:p-4 md:p-6 pt-0">
        {chartData.length > 0 ? (
          <div className="h-full">
            <ResponsiveBar
              data={chartData}
              keys={['quantity']}
              indexBy="product"
              margin={{
                top: 10,
                right: isMobile ? 10 : 20,
                bottom: isMobile ? 100 : isTablet ? 120 : 140,
                left: isMobile ? 50 : isTablet ? 60 : 80
              }}
              padding={isMobile ? 0.1 : 0.2}
              colors={['#6366f1']}
              borderRadius={4}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: isMobile ? 10 : 15,
                tickRotation: -60,
                legendPosition: 'middle',
                legendOffset: 32,
                format: (value) => value.toString()
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: isMobile ? 5 : 10,
                tickRotation: 0,
                legend: isMobile ? 'Кол-во' : 'Количество (шт)',
                legendPosition: 'middle',
                legendOffset: isMobile ? -40 : isTablet ? -50 : -70
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              animate={true}
              motionConfig="gentle"
              tooltip={CustomTooltip}
              role="img"
              ariaLabel="Топ-10 товаров по продажам"
              enableLabel={!isMobile}
              label={d => d.value?.toString() || '0'}
              labelOffset={-36}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fontSize: isMobile ? 9 : isTablet ? 10 : 11
                    }
                  },
                  legend: {
                    text: {
                      fontSize: isMobile ? 10 : isTablet ? 11 : 12
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4 text-gray-300" />
              <p className="text-xs sm:text-sm md:text-base">Нет данных о продажах за последние 30 дней</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;