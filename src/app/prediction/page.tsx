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
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-6">
        <div className=" mx-auto">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Аналитика и прогнозирование
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                История продаж и аналитика по товарам
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto lg:mx-0">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Обзор</span>
                <span className="sm:hidden">Обзор</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">По категориям</span>
                <span className="sm:hidden">Категории</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    История продаж по товарам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSalesChart
                    products={products}
                    selectedProductSid={selectedProductSid}
                    setSelectedProductSid={setSelectedProductSid}
                    isLoadingProducts={isLoadingProducts}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6 mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Аналитика по категориям
                  </CardTitle>
                </CardHeader>
                <CardContent>
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