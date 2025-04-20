"use client";

import { useEffect } from "react";
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
  } = usePredictionStore();
  const { fetchActiveItems, activeItems } = useStoreItemsStore();

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      fetchStats();
      fetchActiveItems();
    }
  }, [checkAuth, fetchStats, fetchActiveItems, router]);

  useEffect(() => {
    if (selectedProductSid) {
      fetchPredictions(selectedProductSid);
    } else if (activeItems.length > 0) {
      // Auto-select first product if none is selected
      setSelectedProduct(activeItems[0].product.sid);
    }
  }, [selectedProductSid, activeItems, fetchPredictions, setSelectedProduct]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Prediction & Analytics
        </h2>
        <p className="text-muted-foreground">
          Analyze sales data and predict future demand
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Analysis</CardTitle>
            <CardDescription>
              Historical sales data for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <SalesAnalytics stats={stats} isLoading={isLoadingStats} />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Product Selection</CardTitle>
            <CardDescription>Select a product to view forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSelector />
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Demand Forecast</CardTitle>
              <CardDescription>
                Predicted demand for the selected product
              </CardDescription>
            </div>
            <ForecastSettings />
          </CardHeader>
          <CardContent className="h-96">
            <ForecastChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
