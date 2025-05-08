// src/components/prediction/sales-analytics.tsx
"use client";

import { useState } from "react";
import { PredictionStats } from "@/lib/types";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SalesAnalyticsProps {
  stats: PredictionStats | null;
  isLoading: boolean;
}

const SalesAnalytics = ({ stats, isLoading }: SalesAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState("quantity");
  const [viewMode, setViewMode] = useState("line");

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка данных о продажах...</p>
      </div>
    );
  }

  if (!stats || stats.dates.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border rounded-md">
        <p className="text-muted-foreground">Нет данных о продажах</p>
        <p className="text-sm text-muted-foreground mt-1">
          Начните продавать товары для генерации аналитики
        </p>
      </div>
    );
  }

  // Transform data for Nivo Line chart
  const prepareLineData = (dataType: "quantity" | "revenue") => {
    const sourceData =
      dataType === "quantity" ? stats.quantity_data : stats.revenue_data;

    return stats.products.map((product) => {
      const data = stats.dates.map((date, index) => {
        return {
          x: date,
          y: sourceData[index]?.[product.product_sid] || 0,
        };
      });

      return {
        id: product.product_name,
        data,
      };
    });
  };

  // Transform data for Bar chart
  const prepareBarData = (dataType: "quantity" | "revenue") => {
    const sourceData =
      dataType === "quantity" ? stats.quantity_data : stats.revenue_data;

    return stats.dates.map((date, dateIndex) => {
      const entry: any = { date };
      stats.products.forEach((product) => {
        entry[product.product_name] =
          sourceData[dateIndex]?.[product.product_sid] || 0;
      });
      return entry;
    });
  };

  const lineData = prepareLineData(activeTab as "quantity" | "revenue");
  const barData = prepareBarData(activeTab as "quantity" | "revenue");

  // Calculate totals for summary
  const totalQuantity = stats.quantity_data.reduce((total, dayData) => {
    const dayTotal = Object.values(dayData).reduce(
      (sum: number, value: any) => sum + (value || 0),
      0
    );
    return total + dayTotal;
  }, 0);

  const totalRevenue = stats.revenue_data.reduce((total, dayData) => {
    const dayTotal = Object.values(dayData).reduce(
      (sum: number, value: any) => sum + (value || 0),
      0
    );
    return total + dayTotal;
  }, 0);

  // Get top products
  const getTopProducts = (dataType: "quantity" | "revenue") => {
    const productTotals = stats.products.map((product) => {
      const sourceData =
        dataType === "quantity" ? stats.quantity_data : stats.revenue_data;
      const total = sourceData.reduce((sum, dayData) => {
        return sum + (dayData[product.product_sid] || 0);
      }, 0);
      return { ...product, total };
    });

    return productTotals.sort((a, b) => b.total - a.total).slice(0, 3);
  };

  const topQuantityProducts = getTopProducts("quantity");
  const topRevenueProducts = getTopProducts("revenue");

  return (
    <div className="h-full space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="shadow-sm">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium text-gray-500">
              Всего продаж
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-2xl font-bold">
              {Math.round(totalQuantity)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium text-gray-500">
              Общая выручка
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium text-gray-500">
              Товаров
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <div className="text-2xl font-bold">{stats.products.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="self-start"
        >
          <TabsList>
            <TabsTrigger value="quantity">Количество</TabsTrigger>
            <TabsTrigger value="revenue">Выручка</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={viewMode}
          onValueChange={setViewMode}
          className="self-start"
        >
          <TabsList>
            <TabsTrigger value="line">Линии</TabsTrigger>
            <TabsTrigger value="bar">Столбцы</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[calc(100%-160px)]">
        {viewMode === "line" ? (
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat={activeTab === "revenue" ? " >-.2f" : " >-.0f"}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "Дата",
              legendOffset: 45,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend:
                activeTab === "quantity"
                  ? "Проданное количество"
                  : "Выручка ($)",
              legendOffset: -40,
              legendPosition: "middle",
              format:
                activeTab === "revenue" ? (value) => `$${value}` : undefined,
            }}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
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
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 11,
                    fill: "#888",
                  },
                },
                legend: {
                  text: {
                    fontSize: 12,
                    fill: "#555",
                  },
                },
              },
              grid: {
                line: {
                  stroke: "#eee",
                  strokeWidth: 1,
                },
              },
              legends: {
                text: {
                  fontSize: 11,
                },
              },
            }}
          />
        ) : (
          <ResponsiveBar
            data={barData}
            keys={stats.products.map((p) => p.product_name)}
            indexBy="date"
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            padding={0.2}
            groupMode="grouped"
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={{ scheme: "nivo" }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "Дата",
              legendOffset: 45,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend:
                activeTab === "quantity"
                  ? "Проданное количество"
                  : "Выручка ($)",
              legendOffset: -40,
              legendPosition: "middle",
              format:
                activeTab === "revenue" ? (value) => `$${value}` : undefined,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 10,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default SalesAnalytics;
