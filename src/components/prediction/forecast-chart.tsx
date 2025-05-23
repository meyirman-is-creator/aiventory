"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { ResponsiveBar } from "@nivo/bar";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
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
  const { fetchPredictions, selectedProductSid } = usePredictionStore();

  const handleRefresh = async () => {
    if (!selectedProductSid || refreshLoading) return;

    setRefreshLoading(true);
    try {
      await fetchPredictions(selectedProductSid, true);
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

  if (loadingState) {
    return (
      <div className="h-full flex items-center justify-center border border-[#e5e7eb] rounded-md bg-[#f9fafb]">
        <div className="flex flex-col items-center text-[#6b7280]">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Загрузка прогноза...</p>
        </div>
      </div>
    );
  }

  if (!productName) {
    return (
      <div className="h-full flex items-center justify-center border border-[#e5e7eb] rounded-md">
        <p className="text-[#6b7280]">
          Выберите продукт для просмотра прогноза
        </p>
      </div>
    );
  }

  if (barData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-[#e5e7eb] rounded-md">
        <p className="text-[#6b7280] mb-4">
          Нет данных прогноза для этого продукта
        </p>
        <Button
          onClick={handleRefresh}
          className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Сгенерировать прогноз
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1f2937]">{productName}</h3>
          <p className="text-sm text-[#6b7280]">
            Прогноз на следующие {predictions.length} {timeframe === TimeFrame.DAY ? "дней" :
              timeframe === TimeFrame.WEEK ? "недель" : "месяцев"}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"
        >
          <RefreshCw className="mr-1 h-4 w-4" />
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
          tooltip={({ value, color, indexValue, data }) => (
            <div className="px-3 py-2 bg-[#ffffff] shadow-lg border border-[#e5e7eb] rounded-md">
              <p className="text-xs font-semibold text-[#1f2937]">{indexValue}</p>
              <p className="text-xs text-[#6b7280]">
                {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
              </p>
              <p className="text-sm font-medium mt-1 text-[#1f2937]">
                Прогноз: <span style={{ color }}>{value}</span> ед.
              </p>
            </div>
          )}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 11,
                  fill: "#6b7280",
                },
              },
              legend: {
                text: {
                  fontSize: 12,
                  fill: "#374151",
                },
              },
            },
            grid: {
              line: {
                stroke: "#e5e7eb",
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