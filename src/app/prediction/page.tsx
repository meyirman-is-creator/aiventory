"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/store/user-store";
import { usePredictionStore } from "@/store/prediction-store";
import ProductSalesChart from "@/components/prediction/product-sales-chart";
import CategorySalesChart from "@/components/prediction/category-sales-chart";
import { Package, BarChart3, TrendingUp, Layers } from "lucide-react";

export default function PredictionPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchProducts,
    fetchCategories,
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
  } = usePredictionStore();

  const [selectedProductSid, setSelectedProductSid] = useState<string | null>(null);
  const [selectedCategorySid, setSelectedCategorySid] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    const loadInitialData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()]);
    };

    loadInitialData();
  }, [checkAuth, fetchProducts, fetchCategories, router]);

  useEffect(() => {
    if (!selectedProductSid && products.length > 0) {
      setSelectedProductSid(products[0].sid);
    }
  }, [selectedProductSid, products]);

  useEffect(() => {
    if (!selectedCategorySid && categories.length > 0) {
      setSelectedCategorySid(categories[0].sid);
    }
  }, [selectedCategorySid, categories]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
                Аналитика и прогнозирование
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm lg:text-base text-gray-600 truncate">
                История продаж и аналитика по товарам
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="mx-auto">
          <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4 lg:space-y-6">
            <TabsList className="grid w-full max-w-xs sm:max-w-sm lg:max-w-md grid-cols-2 mx-auto lg:mx-0 h-8 sm:h-9 lg:h-10">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Обзор</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Категории</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3 sm:space-y-4 lg:space-y-6 mt-3 sm:mt-4 lg:mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl flex items-center gap-1.5 sm:gap-2">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                    <span className="truncate">История продаж по товарам</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <ProductSalesChart
                    products={products}
                    selectedProductSid={selectedProductSid}
                    setSelectedProductSid={setSelectedProductSid}
                    isLoadingProducts={isLoadingProducts}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-3 sm:space-y-4 lg:space-y-6 mt-3 sm:mt-4 lg:mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl flex items-center gap-1.5 sm:gap-2">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                    <span className="truncate">Аналитика по категориям</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <CategorySalesChart
                    categories={categories}
                    selectedCategorySid={selectedCategorySid}
                    setSelectedCategorySid={setSelectedCategorySid}
                    isLoadingCategories={isLoadingCategories}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}