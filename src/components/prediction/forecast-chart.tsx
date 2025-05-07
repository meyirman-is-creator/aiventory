"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { ResponsiveBar } from "@nivo/bar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Prediction, TimeFrame } from "@/lib/types";
import { usePredictionStore } from "@/store/prediction-store";

interface ForecastChartProps {
  predictions?: Prediction[];
  productName?: string;
  timeframe?: TimeFrame;
  isLoading?: boolean;
}

const ForecastChart = ({
  predictions = [],
  productName = "",
  timeframe = TimeFrame.WEEK,
  isLoading = false
}: ForecastChartProps) => {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const { fetchPredictions } = usePredictionStore();

  const handleRefresh = async () => {
    if (!productName || refreshLoading) return;
    
    // Find product sid from the first prediction
    const productSid = predictions.length > 0 ? predictions[0].product_sid : "";
    if (!productSid) return;

    setRefreshLoading(true);
    try {
      await fetchPredictions(productSid, true);
    } finally {
      setRefreshLoading(false);
    }
  };

  const barData = predictions.map((prediction) => ({
    period: formatDate(prediction.period_start),
    forecast: prediction.forecast_qty,
    periodStart: prediction.period_start,
    periodEnd: prediction.period_end,
  }));

  const loadingState = isLoading || refreshLoading;

  if (!productName) {
    return (
      <div className="h-full flex items-center justify-center border rounded-md">
        <p className="text-muted-foreground">
          Выберите продукт для просмотра прогноза
        </p>
      </div>
    );
  }

  if (barData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border rounded-md">
        <p className="text-muted-foreground mb-4">
          Нет данных прогноза для этого продукта
        </p>
        <Button
          onClick={handleRefresh}
          className="bg-brand-purple hover:bg-brand-purple/90"
          disabled={loadingState}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loadingState ? "animate-spin" : ""}`}
          />
          Сгенерировать прогноз
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{productName}</h3>
          <p className="text-sm text-muted-foreground">
            Прогноз на следующие {predictions.length} {timeframe === TimeFrame.DAY ? "дней" : 
              timeframe === TimeFrame.WEEK ? "недель" : "месяцев"}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={loadingState}
        >
          <RefreshCw
            className={`mr-1 h-4 w-4 ${loadingState ? "animate-spin" : ""}`}
          />
          Обновить
        </Button>
      </div>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveBar
          data={barData}
          keys={["forecast"]}
          indexBy="period"
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          padding={0.3}
          colors={["#6322FE"]}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Период",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Прогнозируемое количество",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
          animate={true}
          tooltip={({ id, value, color, indexValue, data }) => (
            <div className="px-3 py-2 bg-white shadow-lg border rounded-md">
              <p className="text-xs font-semibold">{indexValue}</p>
              <p className="text-xs text-gray-600">
                {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
              </p>
              <p className="text-sm font-medium mt-1">
                Прогноз: <span style={{ color }}>{value}</span> ед.
              </p>
            </div>
          )}
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
            tooltip: {
              container: {
                background: "white",
                fontSize: 12,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ForecastChart;