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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PredictionPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchStats,
    fetchProducts,
    fetchCategories,
    stats,
    products,
    categories,
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
    }
  }, [
    selectedProductSid,
    fetchPredictions,
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

  const getCurrentPredictions = (): any[] => {
    if (!selectedProductSid) return [];
    return predictions[selectedProductSid] || [];
  };

  const isLoading =
    isInitialLoading || isLoadingCategories || isLoadingProducts;

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1f2937]">
          Прогнозирование и аналитика
        </h2>
        <p className="text-[#6b7280]">
          Анализируйте данные о продажах и прогнозируйте будущий спрос на товары
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="col-span-full lg:col-span-2 bg-[#ffffff] border-[#e5e7eb]"
        >
          <CardHeader>
            <CardTitle className="text-[#1f2937]">Анализ продаж</CardTitle>
            <CardDescription className="text-[#6b7280]">
              Исторические данные о продажах за последние 30 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <SalesAnalytics
              stats={stats}
              isLoading={isLoadingStats || isInitialLoading}
            />
          </CardContent>
        </Card>

        <Card
          className="col-span-full lg:col-span-1 bg-[#ffffff] border-[#e5e7eb]"
        >
          <CardHeader>
            <div className="flex flex-col space-y-2">
              <CardTitle className="text-[#1f2937]">Выбор продукта</CardTitle>
              <CardDescription className="text-[#6b7280]">
                Выберите продукт для просмотра прогноза
              </CardDescription>

              <div className="pt-2">
                <Label htmlFor="category-filter" className="mb-1 block text-sm text-[#374151]">
                  Категория
                </Label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category-filter" className="w-full border-[#e5e7eb]">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff]">
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.sid} value={category.sid}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProductSelector
              products={products}
              selectedProductSid={selectedProductSid}
              setSelectedProduct={setSelectedProduct}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </CardContent>
        </Card>

        <Card
          className="col-span-full bg-[#ffffff] border-[#e5e7eb]"
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-[#1f2937]">Прогноз спроса</CardTitle>
              <CardDescription className="text-[#6b7280]">
                Прогнозируемый спрос на выбранный продукт на последующие периоды
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