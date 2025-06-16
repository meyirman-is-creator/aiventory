"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/user-store";
import { usePredictionStore } from "@/store/prediction-store";
import ProductSalesChart from "@/components/prediction/product-sales-chart";
import CategorySalesChart from "@/components/prediction/category-sales-chart";
import { Package, TrendingUp } from "lucide-react";

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
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Аналитика и прогнозирование
        </h2>
        <p className="text-muted-foreground">
          История продаж и прогнозы по товарам и категориям
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
      </div>
    </div>
  );
}