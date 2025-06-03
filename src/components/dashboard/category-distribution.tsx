"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";
import { useState } from "react";

interface CategoryDistributionProps {
  data: Array<{
    name: string;
    value: number;
    product_count: number;
  }>;
  isLoading: boolean;
}

const CategoryDistribution = ({ data, isLoading }: CategoryDistributionProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Загрузка распределения по категориям...</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    id: item.name,
    label: item.name,
    value: item.value,
    productCount: item.product_count
  }));

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Распределение товаров по категориям</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)]">
        {chartData.length > 0 ? (
          <div className="h-full relative">
            <ResponsivePie
              data={chartData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'paired' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              onMouseEnter={(node) => setActiveId(node.id.toString())}
              onMouseLeave={() => setActiveId(null)}
              tooltip={({ datum }) => (
                <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                  <div className="font-semibold">{datum.label}</div>
                  <div className="text-sm text-gray-600">
                    Количество: {datum.value.toLocaleString()} шт
                  </div>
                  <div className="text-sm text-gray-600">
                    Продуктов: {datum.data.productCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((datum.value / totalValue) * 100).toFixed(1)}% от общего
                  </div>
                </div>
              )}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000'
                      }
                    }
                  ]
                }
              ]}
            />
            {activeId && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-gray-900">
                  {chartData.find(d => d.id === activeId)?.value.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">единиц</div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Нет данных для отображения
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryDistribution;