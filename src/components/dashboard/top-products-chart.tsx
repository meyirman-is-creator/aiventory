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
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Загрузка топ-10 товаров...</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    product: item.name,
    quantity: item.quantity,
    revenue: item.revenue,
    category: item.category
  }));

  const CustomTooltip = ({ data: tooltipData }: { data: { product: string; quantity: number; revenue: number; category: string } }) => {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="font-semibold text-sm">{tooltipData.product}</p>
        <p className="text-xs text-gray-600 mb-2">{tooltipData.category}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs flex items-center gap-1">
              <Package className="h-3 w-3" />
              Продано:
            </span>
            <span className="text-xs font-medium">{tooltipData.quantity} шт</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Выручка:
            </span>
            <span className="text-xs font-medium">{formatCurrency(tooltipData.revenue)}</span>
          </div>
        </div>
      </div>
    );
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgQuantity = data.length > 0 ? data.reduce((sum, item) => sum + item.quantity, 0) / data.length : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Топ-10 товаров по продажам</CardTitle>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span>За последние 30 дней</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Общая выручка</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Средние продажи</p>
            <p className="text-lg font-semibold text-gray-900">{Math.round(avgQuantity)} шт</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-10rem)]">
        {chartData.length > 0 ? (
          <ResponsiveBar
            data={chartData}
            keys={['quantity']}
            indexBy="product"
            margin={{ top: 10, right: 10, bottom: 100, left: 60 }}
            padding={0.3}
            colors={['#6322FE']}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legendPosition: 'middle',
              legendOffset: 32
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Количество (шт)',
              legendPosition: 'middle',
              legendOffset: -50
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            animate={true}
            motionConfig="gentle"
            tooltip={CustomTooltip}
            role="img"
            ariaLabel="Топ-10 товаров по продажам"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Нет данных о продажах за последние 30 дней</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;