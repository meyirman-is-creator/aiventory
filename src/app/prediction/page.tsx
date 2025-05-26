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
import SalesAnalytics from "@/components/prediction/sales-analytics";
import ProductSelector from "@/components/prediction/product-selector";
import ForecastChart from "@/components/prediction/forecast-chart";
import ForecastSettings from "@/components/prediction/forecast-settings";
import InsightsPanel from "@/components/prediction/insights-panel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Prediction } from "@/lib/types";
import { TrendingUp, Package, BarChart3, Lightbulb } from "lucide-react";

export default function PredictionPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchStats,
    fetchProducts,
    fetchCategories,
    fetchAnalytics,
    stats,
    products,
    categories,
    analytics,
    isLoadingStats,
    isLoadingProducts,
    isLoadingCategories,
    fetchPredictions,
    selectedProductSid,
    setSelectedProduct,
    selectedTimeframe,
    selectedPeriods,
    predictions,
    isLoadingPredictions
  } = usePredictionStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([fetchStats(), fetchCategories()]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [checkAuth, fetchStats, fetchCategories, router]);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchProducts(selectedCategory || undefined, searchTerm || undefined);
    }
  }, [fetchProducts, selectedCategory, searchTerm, isInitialLoading]);

  useEffect(() => {
    if (!selectedProductSid && !isInitialLoading && products.length > 0) {
      setSelectedProduct(products[0].sid);
    }
  }, [selectedProductSid, products, isInitialLoading, setSelectedProduct]);

  useEffect(() => {
    if (selectedProductSid && !isInitialLoading) {
      fetchPredictions(
        selectedProductSid,
        false,
        selectedTimeframe,
        selectedPeriods
      );
      fetchAnalytics(selectedProductSid);
    }
  }, [
    selectedProductSid,
    fetchPredictions,
    fetchAnalytics,
    isInitialLoading,
    selectedTimeframe,
    selectedPeriods,
  ]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCategoryChange = (categorySid: string) => {
    setSelectedCategory(categorySid === "all" ? null : categorySid);
    setSelectedProduct(null);
  };

  const getProductName = (productSid: string): string => {
    const product = products.find((p) => p.sid === productSid);
    return product ? product.name : "Выбранный продукт";
  };

  const getCurrentPredictions = (): Prediction[] => {
    if (!selectedProductSid) return [];
    return predictions[selectedProductSid] || [];
  };

  const isLoading =
    isInitialLoading || isLoadingCategories || isLoadingProducts;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Прогнозирование и аналитика
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Анализируйте данные о продажах и прогнозируйте будущий спрос
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowInsights(!showInsights)}
          className="w-full md:w-auto"
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          {showInsights ? "Скрыть" : "Показать"} инсайты
        </Button>
      </div>

      {showInsights && analytics && (
        <InsightsPanel analytics={analytics} predictions={getCurrentPredictions()} />
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Анализ продаж
                </CardTitle>
                <CardDescription>
                  Исторические данные и тренды
                </CardDescription>
              </div>
              <div className="text-sm text-gray-600">
                Последние 30 дней
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <SalesAnalytics
              stats={stats}
              isLoading={isLoadingStats || isInitialLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Выбор продукта
            </CardTitle>
            <CardDescription>
              Выберите продукт для анализа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-filter" className="text-sm font-medium">
                  Категория
                </Label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category-filter" className="w-full mt-1">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.sid} value={category.sid}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ProductSelector
                products={products}
                selectedProductSid={selectedProductSid}
                setSelectedProduct={setSelectedProduct}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Прогноз спроса
              </CardTitle>
              <CardDescription>
                Прогнозируемый спрос на выбранный продукт
              </CardDescription>
            </div>
            <ForecastSettings />
          </CardHeader>
          <CardContent className="h-96">
            <ForecastChart
              predictions={getCurrentPredictions()}
              productName={
                selectedProductSid ? getProductName(selectedProductSid) : ""
              }
              timeframe={selectedTimeframe}
              isLoading={isLoadingPredictions || isInitialLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}