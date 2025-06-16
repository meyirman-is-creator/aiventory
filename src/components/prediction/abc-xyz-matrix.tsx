"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ABCXYZData {
  matrix: Array<{
    productSid: string;
    productName: string;
    category: string;
    abcClass: "A" | "B" | "C";
    xyzClass: "X" | "Y" | "Z";
    revenue: number;
    revenueShare: number;
    demandVariability: number;
    quantity: number;
  }>;
  summary: {
    A: { count: number; revenueShare: number };
    B: { count: number; revenueShare: number };
    C: { count: number; revenueShare: number };
    X: { count: number };
    Y: { count: number };
    Z: { count: number };
  };
}

interface ABCXYZMatrixProps {
  data: ABCXYZData | null;
  selectedProductSid: string | null;
  isLoading: boolean;
}

const ABCXYZMatrix = ({ data, selectedProductSid, isLoading }: ABCXYZMatrixProps) => {
  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <p>Загрузка ABC/XYZ анализа...</p>
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

  const getClassColor = (abcClass: string, xyzClass: string) => {
    const key = `${abcClass}${xyzClass}`;
    const colors: Record<string, string> = {
      AX: "bg-green-100 border-green-300",
      AY: "bg-green-50 border-green-200",
      AZ: "bg-yellow-50 border-yellow-200",
      BX: "bg-blue-50 border-blue-200",
      BY: "bg-gray-50 border-gray-200",
      BZ: "bg-orange-50 border-orange-200",
      CX: "bg-purple-50 border-purple-200",
      CY: "bg-red-50 border-red-200",
      CZ: "bg-red-100 border-red-300"
    };
    return colors[key] || "bg-gray-50 border-gray-200";
  };

  const getRecommendation = (abcClass: string, xyzClass: string) => {
    const key = `${abcClass}${xyzClass}`;
    const recommendations: Record<string, string> = {
      AX: "Поддерживать высокий уровень запасов, автоматизировать заказы",
      AY: "Учитывать сезонность, увеличивать запасы перед пиками",
      AZ: "Тщательный контроль, индивидуальный подход к закупкам",
      BX: "Оптимизировать запасы, снизить страховой запас",
      BY: "Следить за трендами, корректировать запасы по сезонам",
      BZ: "Минимизировать запасы, заказывать под конкретный спрос",
      CX: "Рассмотреть исключение из ассортимента",
      CY: "Минимальные запасы или работа под заказ",
      CZ: "Кандидаты на исключение из ассортимента"
    };
    return recommendations[key] || "Требуется индивидуальный анализ";
  };

  const matrixGrid: Record<string, typeof data.matrix> = {};
  ["A", "B", "C"].forEach(abc => {
    ["X", "Y", "Z"].forEach(xyz => {
      matrixGrid[`${abc}${xyz}`] = data.matrix.filter(
        item => item.abcClass === abc && item.xyzClass === xyz
      );
    });
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Класс A (80% выручки)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.A.count} товаров</div>
            <p className="text-xs text-gray-500 mt-1">{data.summary.A.revenueShare.toFixed(1)}% от общей выручки</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Класс B (15% выручки)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.B.count} товаров</div>
            <p className="text-xs text-gray-500 mt-1">{data.summary.B.revenueShare.toFixed(1)}% от общей выручки</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Класс C (5% выручки)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.C.count} товаров</div>
            <p className="text-xs text-gray-500 mt-1">{data.summary.C.revenueShare.toFixed(1)}% от общей выручки</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Матрица ABC/XYZ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div className="font-semibold text-center"></div>
            <div className="font-semibold text-center">X (стабильный)</div>
            <div className="font-semibold text-center">Y (сезонный)</div>
            <div className="font-semibold text-center">Z (случайный)</div>

            {["A", "B", "C"].map(abc => (
              <>
                <div key={`${abc}-label`} className="font-semibold text-center py-8">
                  {abc}
                </div>
                {["X", "Y", "Z"].map(xyz => (
                  <div
                    key={`${abc}${xyz}`}
                    className={`border-2 rounded-lg p-3 min-h-[100px] ${getClassColor(abc, xyz)}`}
                  >
                    <div className="text-xs font-semibold mb-1">{abc}{xyz}</div>
                    <div className="text-xs text-gray-600">
                      {matrixGrid[`${abc}${xyz}`].length} товаров
                    </div>
                    {matrixGrid[`${abc}${xyz}`].slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className={`text-xs mt-1 ${
                          item.productSid === selectedProductSid ? "font-bold text-purple-600" : ""
                        }`}
                      >
                        {item.productName.substring(0, 20)}...
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Детальный анализ товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Товар</th>
                  <th className="text-center py-2">ABC/XYZ</th>
                  <th className="text-right py-2">Выручка</th>
                  <th className="text-right py-2">Доля</th>
                  <th className="text-right py-2">Вариативность</th>
                  <th className="text-left py-2">Рекомендация</th>
                </tr>
              </thead>
              <tbody>
                {data.matrix
                  .filter(item => selectedProductSid ? item.productSid === selectedProductSid : true)
                  .slice(0, 20)
                  .map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        <Badge variant="outline" className="text-xs">
                          {item.abcClass}{item.xyzClass}
                        </Badge>
                      </td>
                      <td className="text-right py-2">{formatCurrency(item.revenue)}</td>
                      <td className="text-right py-2">{item.revenueShare.toFixed(1)}%</td>
                      <td className="text-right py-2">{item.demandVariability.toFixed(1)}%</td>
                      <td className="text-left py-2 text-xs max-w-xs">
                        {getRecommendation(item.abcClass, item.xyzClass)}
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

export default ABCXYZMatrix;