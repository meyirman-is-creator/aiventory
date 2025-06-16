"use client";

import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface OptimalPurchaseData {
  reorderPoint: number;
  safetyStock: number;
  economicOrderQuantity: number;
  leadTimeDays: number;
  currentStock: number;
  averageDailyDemand: number;
  stockoutRisk: boolean;
  nextOrderDate: string;
  stockProjection: Array<{
    date: string;
    stock: number;
    reorderPoint: number;
  }>;
}

interface OptimalPurchaseChartProps {
  data: OptimalPurchaseData | null;
  productName: string;
  isLoading: boolean;
}

const OptimalPurchaseChart = ({ data, productName, isLoading }: OptimalPurchaseChartProps) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Расчет оптимальных закупок...</p>
        </div>
      </div>
    );
  }

  if (!data || !productName) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Выберите продукт для анализа закупок</p>
      </div>
    );
  }

  const lineData = [
    {
      id: "Текущий запас",
      data: data.stockProjection.map(item => ({
        x: item.date,
        y: item.stock
      }))
    },
    {
      id: "Точка перезаказа",
      data: data.stockProjection.map(item => ({
        x: item.date,
        y: item.reorderPoint
      }))
    }
  ];

  const daysUntilReorder = Math.ceil(
    (data.currentStock - data.reorderPoint) / data.averageDailyDemand
  );

  return (
    <div className="space-y-4">
      {data.stockoutRisk && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Критически низкий уровень запасов! Необходимо срочно сделать заказ.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">EOQ (оптим. партия)</p>
          <p className="text-lg font-semibold">{Math.round(data.economicOrderQuantity)} ед.</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Точка перезаказа</p>
          <p className="text-lg font-semibold">{Math.round(data.reorderPoint)} ед.</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Страховой запас</p>
          <p className="text-lg font-semibold">{Math.round(data.safetyStock)} ед.</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Срок поставки</p>
          <p className="text-lg font-semibold">{data.leadTimeDays} дней</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Следующий заказ</p>
          <p className="text-base font-semibold">{formatDate(data.nextOrderDate)}</p>
        </div>
        <Badge 
          variant={data.stockoutRisk ? "destructive" : daysUntilReorder < 7 ? "secondary" : "default"}
          className="text-xs"
        >
          {data.stockoutRisk ? "Срочный заказ" : `Через ${daysUntilReorder} дней`}
        </Badge>
      </div>

      <div className="h-64">
        <ResponsiveLine
          data={lineData}
          margin={{ top: 10, right: 20, bottom: 50, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: 0, max: "auto" }}
          axisBottom={{
            tickRotation: -45,
            legend: "Дата",
            legendPosition: "middle",
            legendOffset: 45
          }}
          axisLeft={{
            legend: "Количество",
            legendPosition: "middle",
            legendOffset: -40
          }}
          pointSize={6}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={true}
          colors={["#6322FE", "#ef4444"]}
          enableArea={true}
          areaOpacity={0.1}
          legends={[
            {
              anchor: "top-right",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: -20,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 120,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle"
            }
          ]}
        />
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Рекомендация по закупке
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Рекомендуется заказать <span className="font-semibold">{Math.round(data.economicOrderQuantity)} единиц</span> товара 
            &quot;{productName}&quot; <span className="font-semibold">{formatDate(data.nextOrderDate)}</span>.
            Это обеспечит оптимальный баланс между затратами на хранение и доставку.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimalPurchaseChart;