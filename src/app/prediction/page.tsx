"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/store/user-store";
import { usePredictionStore } from "@/store/prediction-store";
import { useStoreItemsStore } from "@/store/store-items-store";
import SalesAnalytics from "@/components/prediction/sales-analytics";
import ProductSelector from "@/components/prediction/product-selector";
import ForecastChart from "@/components/prediction/forecast-chart";
import ForecastSettings from "@/components/prediction/forecast-settings";
import { PredictionStats, TimeFrame, Prediction } from "@/lib/types";

const colors = {
  purple: '#6322FE',
  purpleLight: '#EBE3FF',
  textDark: '#1f2937',
  textMuted: '#4b5563',
  white: '#ffffff',
  border: '#e5e7eb',
  bgLight: '#f9fafb',
};

const mockPredictionStats: PredictionStats = {
  dates: [
    "2025-04-05",
    "2025-04-12",
    "2025-04-19",
    "2025-04-26",
    "2025-05-03"
  ],
  products: [
    { product_sid: "100000000002", product_name: "Молоко 3.2%" },
    { product_sid: "100000000003", product_name: "Йогурт натуральный" },
    { product_sid: "100000000004", product_name: "Сметана 20%" },
    { product_sid: "100000000006", product_name: "Сыр Российский" }
  ],
  quantity_data: [
    { "100000000002": 25, "100000000003": 18, "100000000004": 15, "100000000006": 10 },
    { "100000000002": 22, "100000000003": 20, "100000000004": 14, "100000000006": 12 },
    { "100000000002": 28, "100000000003": 19, "100000000004": 16, "100000000006": 9 },
    { "100000000002": 24, "100000000003": 21, "100000000004": 18, "100000000006": 11 },
    { "100000000002": 26, "100000000003": 22, "100000000004": 17, "100000000006": 13 }
  ],
  revenue_data: [
    { "100000000002": 950, "100000000003": 504, "100000000004": 480, "100000000006": 3200 },
    { "100000000002": 836, "100000000003": 560, "100000000004": 448, "100000000006": 3840 },
    { "100000000002": 1064, "100000000003": 532, "100000000004": 512, "100000000006": 2880 },
    { "100000000002": 912, "100000000003": 588, "100000000004": 576, "100000000006": 3520 },
    { "100000000002": 988, "100000000003": 616, "100000000004": 544, "100000000006": 4160 }
  ]
};

const generateMockPredictions = (
  productSid: string, 
  productName: string
): Prediction[] => {
  const today = new Date();
  const result: Prediction[] = [];
  
  for (let i = 0; i < 6; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + i * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    result.push({
      sid: `mock-prediction-${i}`,
      product_sid: productSid,
      timeframe: TimeFrame.WEEK,
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      forecast_qty: Math.floor(Math.random() * 30) + 15,
      generated_at: new Date().toISOString(),
      model_version: "mock-v1.0",
      product: {
        sid: productSid,
        name: productName,
        category_sid: "dairy",
        default_price: 10
      }
    });
  }
  
  return result;
};

export default function PredictionPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchStats,
    stats,
    isLoadingStats,
    fetchPredictions,
    selectedProductSid,
    setSelectedProduct,
    selectedTimeframe,
    selectedPeriods,
    predictions,
    isLoadingPredictions,
    setSelectedTimeframe,
    setSelectedPeriods
  } = usePredictionStore();
  const { fetchActiveItems, activeItems } = useStoreItemsStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [mockPredictionsData, setMockPredictionsData] = useState<Record<string, Prediction[]>>({});

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchActiveItems()
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [checkAuth, fetchStats, fetchActiveItems, router]);

  useEffect(() => {
    if (activeItems.length > 0) {
      const mockData: Record<string, Prediction[]> = {};
      
      activeItems.forEach(item => {
        mockData[item.product.sid] = generateMockPredictions(
          item.product.sid, 
          item.product.name
        );
      });
      
      setMockPredictionsData(mockData);
      
      if (!selectedProductSid && !isInitialLoading) {
        setSelectedProduct(activeItems[0].product.sid);
      }
    }
  }, [activeItems, selectedProductSid, setSelectedProduct, isInitialLoading]);

  useEffect(() => {
    if (selectedProductSid && !isInitialLoading) {
      fetchPredictions(selectedProductSid, false, selectedTimeframe, selectedPeriods);
    }
  }, [
    selectedProductSid, 
    fetchPredictions, 
    isInitialLoading, 
    selectedTimeframe, 
    selectedPeriods
  ]);

  if (!isAuthenticated) {
    return null;
  }

  const displayStats = stats || mockPredictionStats;
  
  const getProductName = (productSid: string): string => {
    const item = activeItems.find(item => item.product.sid === productSid);
    return item ? item.product.name : "Выбранный продукт";
  };
  
  const getProductPredictions = (): Prediction[] => {
    if (!selectedProductSid) return [];
    
    const realPredictions = predictions[selectedProductSid];
    if (realPredictions && realPredictions.length > 0) {
      return realPredictions;
    }
    
    return mockPredictionsData[selectedProductSid] || [];
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Прогнозирование и аналитика
        </h2>
        <p className="text-gray-600">
          Анализируйте данные о продажах и прогнозируйте будущий спрос
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="col-span-full lg:col-span-2"
          style={{borderColor: colors.border, backgroundColor: colors.white}}
        >
          <CardHeader>
            <CardTitle className="text-gray-900">Анализ продаж</CardTitle>
            <CardDescription className="text-gray-600">
              Исторические данные о продажах за последние 30 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <SalesAnalytics 
              stats={displayStats} 
              isLoading={isLoadingStats || isInitialLoading} 
            />
          </CardContent>
        </Card>

        <Card 
          className="col-span-full lg:col-span-1"
          style={{borderColor: colors.border, backgroundColor: colors.white}}
        >
          <CardHeader>
            <CardTitle className="text-gray-900">Выбор продукта</CardTitle>
            <CardDescription className="text-gray-600">
              Выберите продукт для просмотра прогноза
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSelector />
          </CardContent>
        </Card>

        <Card 
          className="col-span-full"
          style={{borderColor: colors.border, backgroundColor: colors.white}}
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-gray-900">Прогноз спроса</CardTitle>
              <CardDescription className="text-gray-600">
                Прогнозируемый спрос на выбранный продукт
              </CardDescription>
            </div>
            <ForecastSettings />
          </CardHeader>
          <CardContent className="h-96">
            <ForecastChart 
              predictions={getProductPredictions()}
              productName={selectedProductSid ? getProductName(selectedProductSid) : ""}
              timeframe={selectedTimeframe} 
              isLoading={isLoadingPredictions || isInitialLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}