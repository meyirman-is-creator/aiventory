// src/app/prediction/page.tsx

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
import { TimeFrame, ProductCategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const colors = {
  purple: "#6322FE",
  purpleLight: "#EBE3FF",
  textDark: "#1f2937",
  textMuted: "#4b5563",
  white: "#ffffff",
  border: "#e5e7eb",
  bgLight: "#f9fafb",
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
    setSelectedPeriods,
  } = usePredictionStore();
  const { fetchActiveItems, activeItems } = useStoreItemsStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // Load data in parallel
        await Promise.all([fetchStats(), fetchActiveItems()]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [checkAuth, fetchStats, fetchActiveItems, router]);

  // Extract unique categories from active items
  useEffect(() => {
    if (activeItems.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          activeItems
            .filter((item) => item.product.category)
            .map((item) => ({
              sid: item.product.category?.sid || "",
              name: item.product.category?.name || "",
            }))
        )
      ).filter((category) => category.sid && category.name);

      setCategories(uniqueCategories as ProductCategory[]);
    }
  }, [activeItems]);

  // Automatically select first product after data loading
  useEffect(() => {
    if (!selectedProductSid && !isInitialLoading && activeItems.length > 0) {
      // If we have a category filter, select the first product from that category
      if (selectedCategory) {
        const filteredItems = activeItems.filter(
          (item) => item.product.category?.sid === selectedCategory
        );

        if (filteredItems.length > 0) {
          setSelectedProduct(filteredItems[0].product.sid);
        }
      } else {
        // Otherwise select the first product
        setSelectedProduct(activeItems[0].product.sid);
      }
    }
  }, [
    selectedProductSid,
    activeItems,
    isInitialLoading,
    setSelectedProduct,
    selectedCategory,
  ]);

  // Fetch predictions when product, timeframe, or periods change
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

    // Reset selected product when category changes
    setSelectedProduct(null);
  };

  const getProductName = (productSid: string): string => {
    const item = activeItems.find((item) => item.product.sid === productSid);
    return item ? item.product.name : "Выбранный продукт";
  };

  const getCurrentPredictions = (): any[] => {
    if (!selectedProductSid) return [];
    return predictions[selectedProductSid] || [];
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Прогнозирование и аналитика
        </h2>
        <p className="text-gray-600">
          Анализируйте данные о продажах и прогнозируйте будущий спрос на товары
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="col-span-full lg:col-span-2"
          style={{ borderColor: colors.border, backgroundColor: colors.white }}
        >
          <CardHeader>
            <CardTitle className="text-gray-900">Анализ продаж</CardTitle>
            <CardDescription className="text-gray-600">
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
          className="col-span-full lg:col-span-1"
          style={{ borderColor: colors.border, backgroundColor: colors.white }}
        >
          <CardHeader>
            <div className="flex flex-col space-y-2">
              <CardTitle className="text-gray-900">Выбор продукта</CardTitle>
              <CardDescription className="text-gray-600">
                Выберите продукт для просмотра прогноза
              </CardDescription>

              <div className="pt-2">
                <Label htmlFor="category-filter" className="mb-1 block text-sm">
                  Категория
                </Label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category-filter" className="w-full">
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
            </div>
          </CardHeader>
          <CardContent>
            <ProductSelector
              selectedCategory={selectedCategory}
              isLoading={isInitialLoading}
            />
          </CardContent>
        </Card>

        <Card
          className="col-span-full"
          style={{ borderColor: colors.border, backgroundColor: colors.white }}
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-gray-900">Прогноз спроса</CardTitle>
              <CardDescription className="text-gray-600">
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
