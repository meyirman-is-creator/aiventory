"use client";

import { useState } from "react";
import { PredictionStats } from "@/lib/types";
import { ResponsiveLine } from "@nivo/line";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalesAnalyticsProps {
  stats: PredictionStats | null;
  isLoading: boolean;
}

const SalesAnalytics = ({ stats, isLoading }: SalesAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState("quantity");

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

  const lineData = prepareLineData(activeTab as "quantity" | "revenue");

  return (
    <div className="h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <TabsList className="self-start">
          <TabsTrigger value="quantity">Количество</TabsTrigger>
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
        </TabsList>

        <TabsContent value="quantity" className="flex-grow">
          <div className="h-full">
            <ResponsiveLine
              data={lineData}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
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
                legend: "Проданное количество",
                legendOffset: -40,
                legendPosition: "middle",
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
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="flex-grow">
          <div className="h-full">
            <ResponsiveLine
              data={lineData}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
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
                legend: "Выручка ($)",
                legendOffset: -40,
                legendPosition: "middle",
                format: (value) => `$${value}`,
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;