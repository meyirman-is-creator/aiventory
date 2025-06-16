"use client";

import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialData {
  marginByCategory: Array<{
    category: string;
    margin: number;
    revenue: number;
  }>;
  avgCheckTrend: Array<{
    month: string;
    avgCheck: number;
    transactionCount: number;
  }>;
  productLTV: Array<{
    productName: string;
    ltv: number;
    avgPurchaseFrequency: number;
    avgOrderValue: number;
  }>;
  profitability: {
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
    lossesImpact: number;
  };
}

interface FinancialMetricsProps {
  data: FinancialData | null;
  isLoading: boolean;
}

const FinancialMetrics = ({ data, isLoading }: FinancialMetricsProps) => {
  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Загрузка финансовых метрик...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-gray-500">Нет данных для анализа</p>
      </div>
    );
  }

  const avgCheckLineData = [{
    id: "Средний чек",
    data: data.avgCheckTrend.map(item => ({
      x: item.month,
      y: item.avgCheck
    }))
  }];

  const marginPieData = data.marginByCategory.map(item => ({
    id: item.category,
    label: item.category,
    value: item.revenue,
    margin: item.margin
  }));

  const avgCheckChange = data.avgCheckTrend.length >= 2
    ? ((data.avgCheckTrend[data.avgCheckTrend.length - 1].avgCheck / 
        data.avgCheckTrend[0].avgCheck - 1) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Валовая прибыль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.profitability.grossProfit)}</div>
            <p className="text-xs text-gray-500 mt-1">Маржа: {data.profitability.grossMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Чистая прибыль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.profitability.netProfit)}</div>
            <p className="text-xs text-gray-500 mt-1">Маржа: {data.profitability.netMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Влияние потерь
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{data.profitability.lossesImpact.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">от валовой прибыли</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Средний чек
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.avgCheckTrend[data.avgCheckTrend.length - 1]?.avgCheck || 0)}
            </div>
            <div className={`flex items-center text-xs mt-1 ${avgCheckChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {avgCheckChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(avgCheckChange).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Маржинальность по категориям</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsivePie
              data={marginPieData}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: "set3" }}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              tooltip={({ datum }) => (
                <div className="px-3 py-2 bg-white shadow-lg border rounded-md">
                  <p className="font-semibold">{datum.label}</p>
                  <p className="text-sm">Выручка: {formatCurrency(datum.value)}</p>
                  <p className="text-sm">Маржа: {datum.data.margin.toFixed(1)}%</p>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Динамика среднего чека</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveLine
              data={avgCheckLineData}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              axisBottom={{
                tickRotation: -45,
                legend: "Месяц",
                legendPosition: "middle",
                legendOffset: 45
              }}
              axisLeft={{
                legend: "Средний чек (₸)",
                legendPosition: "middle",
                legendOffset: -50,
                format: value => `${(value / 1000).toFixed(0)}K`
              }}
              pointSize={8}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              useMesh={true}
              colors={["#6322FE"]}
              enableArea={true}
              areaOpacity={0.1}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LTV товаров (Lifetime Value)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Товар</th>
                  <th className="text-right py-2">LTV</th>
                  <th className="text-right py-2">Частота покупок</th>
                  <th className="text-right py-2">Средний заказ</th>
                  <th className="text-right py-2">Прогноз LTV (год)</th>
                </tr>
              </thead>
              <tbody>
                {data.productLTV.slice(0, 10).map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{product.productName}</td>
                    <td className="text-right py-2 font-semibold">{formatCurrency(product.ltv)}</td>
                    <td className="text-right py-2">{product.avgPurchaseFrequency.toFixed(1)} раз/мес</td>
                    <td className="text-right py-2">{formatCurrency(product.avgOrderValue)}</td>
                    <td className="text-right py-2 text-green-600 font-semibold">
                      {formatCurrency(product.ltv * 12)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetrics;