"use client";

import { useState, useEffect } from "react";
import { usePredictionStore } from "@/store/prediction-store";
import { useStoreItemsStore } from "@/store/store-items-store";
import { formatDate } from "@/lib/utils";
import { ResponsiveBar } from "@nivo/bar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const ForecastChart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    predictions,
    selectedProductSid,
    selectedTimeframe,
    fetchPredictions,
  } = usePredictionStore();
  const { activeItems } = useStoreItemsStore();

  // Find product details
  const selectedProduct = activeItems.find(
    (item) => item.product.sid === selectedProductSid
  )?.product;

  // Check if we have predictions for this product
  const productPredictions = selectedProductSid
    ? predictions[selectedProductSid] || []
    : [];

  // Refresh forecast
  const handleRefresh = async () => {
    if (!selectedProductSid) return;

    setIsLoading(true);
    try {
      await fetchPredictions(selectedProductSid, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Format data for bar chart
  const barData = productPredictions.map((prediction) => ({
    period: formatDate(prediction.period_start),
    forecast: prediction.forecast_qty,
    periodStart: prediction.period_start,
    periodEnd: prediction.period_end,
  }));

  if (!selectedProductSid || !selectedProduct) {
    return (
      <div className="h-full flex items-center justify-center border rounded-md">
        <p className="text-muted-foreground">
          Select a product to view forecast
        </p>
      </div>
    );
  }

  if (barData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border rounded-md">
        <p className="text-muted-foreground mb-4">
          No forecast data available for this product
        </p>
        <Button
          onClick={handleRefresh}
          className="bg-brand-purple hover:bg-brand-purple/90"
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Generate Forecast
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
          <p className="text-sm text-muted-foreground">
            Forecast for next {productPredictions.length} {selectedTimeframe}
            {productPredictions.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
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
            legend: "Period",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Forecasted Quantity",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          tooltip={({ id, value, color, indexValue, data }) => (
            <div className="px-3 py-2 bg-white shadow-lg border rounded-md">
              <p className="text-xs font-semibold">{indexValue}</p>
              <p className="text-xs text-gray-600">
                {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
              </p>
              <p className="text-sm font-medium mt-1">
                Forecast: <span style={{ color }}>{value}</span> units
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
