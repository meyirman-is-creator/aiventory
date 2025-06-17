"use client";

import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LossData {
  monthlyLosses: Array<{
    month: string;
    expired: number;
    discounted: number;
    total: number;
  }>;
  discountROI: Array<{
    discountRange: string;
    roi: number;
    salesIncrease: number;
  }>;
  expiryEfficiency: {
    managedBeforeExpiry: number;
    expired: number;
    avgDaysBeforeAction: number;
  };
  totalLosses: {
    expired: number;
    discounts: number;
    total: number;
  };
}

interface LossAnalyticsProps {
  data: LossData | null;
  selectedProductSid: string | null;
  isLoading: boolean;
}

const LossAnalytics = ({ data, isLoading }: LossAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Загрузка данных о потерях...</p>
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

  const lossesLineData = [
    {
      id: "Просрочка",
      data: data.monthlyLosses.map(item => ({
        x: item.month,
        y: item.expired
      }))
    },
    {
      id: "Скидки",
      data: data.monthlyLosses.map(item => ({
        x: item.month,
        y: item.discounted
      }))
    }
  ];

  const efficiencyRate = (data.expiryEfficiency.managedBeforeExpiry / 
    (data.expiryEfficiency.managedBeforeExpiry + data.expiryEfficiency.expired)) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Потери от просрочки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totalLosses.expired)}
            </div>
            <p className="text-xs text-gray-500 mt-1">за последние 30 дней</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Потери от скидок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.totalLosses.discounts)}
            </div>
            <p className="text-xs text-gray-500 mt-1">упущенная выгода</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Эффективность управления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {efficiencyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">товаров реализовано вовремя</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Средний срок до действия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.expiryEfficiency.avgDaysBeforeAction} дней
            </div>
            <p className="text-xs text-gray-500 mt-1">до применения скидки</p>
          </CardContent>
        </Card>
      </div>

      {efficiencyRate < 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Эффективность управления сроками годности ниже оптимальной. 
            Рекомендуется применять скидки за {data.expiryEfficiency.avgDaysBeforeAction + 5} дней до истечения срока.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Динамика потерь по месяцам</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveLine
              data={lossesLineData}
              margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: "auto" }}
              axisBottom={{
                tickRotation: -45,
                legend: "Месяц",
                legendPosition: "middle",
                legendOffset: 45
              }}
              axisLeft={{
                legend: "Потери (₸)",
                legendPosition: "middle",
                legendOffset: -50,
                format: value => `${(value / 1000).toFixed(0)}K`
              }}
              pointSize={8}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              useMesh={true}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ROI скидок
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveBar
              data={data.discountROI}
              keys={["roi"]}
              indexBy="discountRange"
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              padding={0.3}
              colors={({ data }) => data.roi > 100 ? "#10b981" : "#ef4444"}
              axisBottom={{
                tickRotation: -45,
                legend: "Размер скидки",
                legendPosition: "middle",
                legendOffset: 50
              }}
              axisLeft={{
                legend: "ROI (%)",
                legendPosition: "middle",
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              tooltip={({ data }) => (
                <div className="px-3 py-2 bg-white shadow-lg border rounded-md">
                  <p className="font-semibold">Скидка: {data.discountRange}</p>
                  <p className="text-sm">ROI: {data.roi}%</p>
                  <p className="text-sm">Рост продаж: +{data.salesIncrease}%</p>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Рекомендации по оптимизации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.discountROI.filter(d => d.roi > 150).length > 0 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Скидки {data.discountROI.filter(d => d.roi > 150).map(d => d.discountRange).join(", ")} 
                  показывают высокий ROI. Рассмотрите возможность их более частого применения.
                </AlertDescription>
              </Alert>
            )}
            
            {data.expiryEfficiency.avgDaysBeforeAction < 7 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Скидки применяются слишком поздно. Начинайте со скидок за 14 дней до истечения срока годности.
                </AlertDescription>
              </Alert>
            )}

            {data.totalLosses.expired > data.totalLosses.discounts && (
              <Alert>
                <AlertDescription>
                  Потери от просрочки превышают потери от скидок. Увеличьте использование превентивных скидок.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LossAnalytics;