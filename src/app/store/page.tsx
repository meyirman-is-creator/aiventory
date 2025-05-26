"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchActiveItems,
  fetchRemovedItems,
  fetchReports,
  fetchSalesHistory,
} from "@/redux/slices/storeSlice";
import { RootState, AppDispatch } from "@/redux/store";
import ActiveItemsTable from "@/components/store/active-items-table";
import RemovedItemsTable from "@/components/store/removed-items-table";
import SalesHistoryTable from "@/components/store/sales-history-table";
import StoreStats from "@/components/store/store-stats";
import SellByBarcodeButton from "@/components/store/sell-by-barcode-button";
import { useUserStore } from "@/store/user-store";

export default function StorePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, checkAuth } = useUserStore();

  const {
    activeItems,
    removedItems,
    salesHistory,
    reports,
    isLoadingItems,
    isLoadingRemovedItems,
    isLoadingSales,
    isLoadingReports,
  } = useSelector((state: RootState) => state.store);

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      dispatch(fetchActiveItems());
      dispatch(fetchRemovedItems());
      dispatch(fetchSalesHistory({}));
      dispatch(fetchReports());
    }
  }, [checkAuth, dispatch, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1f2937]">
            Управление магазином
          </h2>
          <p className="text-sm sm:text-base text-[#6b7280] mt-1">
            Управляйте запасами магазина, просматривайте товары с истекающим
            сроком и регистрируйте продажи
          </p>
        </div>
        <div>
          <SellByBarcodeButton />
        </div>
      </div>

      <StoreStats reports={reports} isLoading={isLoadingReports} />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#f3f4f6]">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Активные товары</span>
            <span className="sm:hidden">Активные</span>
            <span
              className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-full px-1.5 sm:px-2.5 py-0.5 text-xs font-semibold bg-[#EBE3FF] text-[#6322FE]"
            >
              {activeItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="removed"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Убранные товары</span>
            <span className="sm:hidden">Убранные</span>
            <span
              className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-full px-1.5 sm:px-2.5 py-0.5 text-xs font-semibold bg-[#fee2e2] text-[#ef4444]"
            >
              {removedItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">История продаж</span>
            <span className="sm:hidden">Продажи</span>
            <span
              className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-full px-1.5 sm:px-2.5 py-0.5 text-xs font-semibold bg-[#d1fae5] text-[#065f46]"
            >
              {salesHistory.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl text-[#1f2937]">Товары в магазине</CardTitle>
              <CardDescription className="text-sm text-[#6b7280]">
                Все товары, доступные в данный момент для продажи в вашем
                магазине
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <ActiveItemsTable
                items={activeItems}
                isLoading={isLoadingItems}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="removed" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl text-[#1f2937]">
                Убранные товары
              </CardTitle>
              <CardDescription className="text-sm text-[#6b7280]">
                Товары, которые были убраны с витрины из-за истечения срока годности или вручную
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <RemovedItemsTable
                items={removedItems}
                isLoading={isLoadingRemovedItems}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl text-[#1f2937]">История продаж</CardTitle>
              <CardDescription className="text-sm text-[#6b7280]">
                Все проданные товары и детали транзакций
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <SalesHistoryTable
                sales={salesHistory}
                isLoading={isLoadingSales}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}