"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/store/user-store";
import { usePredictionStore } from "@/store/prediction-store";
import ProductSalesChart from "@/components/prediction/product-sales-chart";
import CategorySalesChart from "@/components/prediction/category-sales-chart";
import ThreeMonthForecast from "@/components/prediction/three-month-forecast";
import { Package, TrendingUp, BarChart3 } from "lucide-react";

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

  const selectedProduct = products.find(p => p.sid === selectedProductSid);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Аналитика и прогнозирование
        </h2>
        <p className="text-muted-foreground">
          История продаж, прогнозы и аналитика по товарам
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="forecast">Прогноз на 3 месяца</TabsTrigger>
          <TabsTrigger value="categories">По категориям</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
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

        <TabsContent value="forecast" className="space-y-4">
          {selectedProduct && selectedProductSid && (
            <ThreeMonthForecast
              productSid={selectedProductSid}
              productName={selectedProduct.name}
            />
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
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
  );
}