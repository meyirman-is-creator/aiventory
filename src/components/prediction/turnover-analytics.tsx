"use client";

import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TurnoverData {
  averageRealizationDays: number;
  categoryTurnover: Array<{
    category: string;
    turnoverRate: number;
    avgDays: number;
  }>;
  slowMovingProducts: Array<{
    name: string;
    daysInStock: number;
    quantity: number;
    value: number;
  }>;
  turnoverTrend: Array<{
    month: string;
    turnoverRate: number;
  }>;
}

interface TurnoverAnalyticsProps {
  data: TurnoverData | null;
  isLoading: boolean;
}

const TurnoverAnalytics = ({ data, isLoading }: TurnoverAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Загрузка данных оборачиваемости...</p>
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

  const lineData = [{
    id: "Оборачиваемость",
    data: data.turnoverTrend.map(item => ({
      x: item.month,
      y: item.turnoverRate
    }))
  }];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Средний срок реализации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRealizationDays} дней</div>
            <p className="text-xs text-gray-500 mt-1">от поступления до продажи</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Товары-залежи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.slowMovingProducts.length}</div>
            <p className="text-xs text-gray-500 mt-1">товаров &gt; 30 дней</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Общая стоимость залежей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.slowMovingProducts.reduce((sum, p) => sum + p.value, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">потенциальные потери</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Оборачиваемость по категориям</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveBar
              data={data.categoryTurnover}
              keys={["turnoverRate"]}
              indexBy="category"
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              padding={0.3}
              colors={["#6322FE"]}
              axisBottom={{
                tickRotation: -45,
                legend: "Категория",
                legendPosition: "middle",
                legendOffset: 50
              }}
              axisLeft={{
                legend: "Оборачиваемость (раз/мес)",
                legendPosition: "middle",
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              tooltip={({ data }) => (
                <div className="px-3 py-2 bg-white shadow-lg border rounded-md">
                  <p className="font-semibold">{data.category}</p>
                  <p className="text-sm">Оборачиваемость: {data.turnoverRate.toFixed(2)} раз/мес</p>
                  <p className="text-sm">Средний срок: {data.avgDays} дней</p>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Динамика оборачиваемости</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveLine
              data={lineData}
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
                legend: "Оборачиваемость",
                legendPosition: "middle",
                legendOffset: -50
              }}
              pointSize={8}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              useMesh={true}
              colors={["#6322FE"]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товары с низкой оборачиваемостью
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Товар</th>
                  <th className="text-right py-2">Дней на складе</th>
                  <th className="text-right py-2">Количество</th>
                  <th className="text-right py-2">Стоимость</th>
                  <th className="text-center py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {data.slowMovingProducts.slice(0, 10).map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{product.name}</td>
                    <td className="text-right py-2">{product.daysInStock}</td>
                    <td className="text-right py-2">{product.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(product.value)}</td>
                    <td className="text-center py-2">
                      {product.daysInStock > 60 ? (
                        <Badge variant="destructive" className="text-xs">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Критично
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Внимание
                        </Badge>
                      )}
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

export default TurnoverAnalytics;