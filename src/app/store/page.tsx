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
  fetchExpiredItems,
  fetchReports,
  fetchCartItems,
  fetchSalesHistory,
} from "@/redux/slices/storeSlice";
import { RootState, AppDispatch } from "@/redux/store";
import ActiveItemsTable from "@/components/store/active-items-table";
import ExpiredItemsTable from "@/components/store/expired-items-table";
import CartItemsTable from "@/components/store/cart-items-table";
import SalesHistoryTable from "@/components/store/sales-history-table";
import StoreStats from "@/components/store/store-stats";
import { useUserStore } from "@/store/user-store";

export default function StorePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, checkAuth } = useUserStore();

  const {
    activeItems,
    expiredItems,
    cartItems,
    salesHistory,
    reports,
    isLoadingItems,
    isLoadingCart,
    isLoadingSales,
    isLoadingReports,
  } = useSelector((state: RootState) => state.store);

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      dispatch(fetchActiveItems());
      dispatch(fetchExpiredItems());
      dispatch(fetchCartItems());
      dispatch(fetchSalesHistory({}));
      dispatch(fetchReports());
    }
  }, [checkAuth, dispatch, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#1f2937]">
          Управление магазином
        </h2>
        <p className="text-[#6b7280]">
          Управляйте запасами магазина, просматривайте товары с истекающим
          сроком и регистрируйте продажи
        </p>
      </div>

      <StoreStats reports={reports} isLoading={isLoadingReports} />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#f3f4f6]">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
          >
            Активные товары
            <span
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#EBE3FF] text-[#6322FE]"
            >
              {activeItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="cart"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
          >
            Корзина
            <span
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#dbeafe] text-[#2563eb]"
            >
              {cartItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
          >
            Истекшие товары
            <span
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#fee2e2] text-[#ef4444]"
            >
              {expiredItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
          >
            Проданные товары
            <span
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#d1fae5] text-[#065f46]"
            >
              {salesHistory.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader>
              <CardTitle className="text-[#1f2937]">Товары в магазине</CardTitle>
              <CardDescription className="text-[#6b7280]">
                Все товары, доступные в данный момент для продажи в вашем
                магазине
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ActiveItemsTable
                items={activeItems}
                isLoading={isLoadingItems}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader>
              <CardTitle className="text-[#1f2937]">Корзина</CardTitle>
              <CardDescription className="text-[#6b7280]">
                Товары, добавленные в корзину для продажи
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <CartItemsTable
                items={cartItems}
                isLoading={isLoadingCart}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader>
              <CardTitle className="text-[#1f2937]">
                Истекшие и удаленные товары
              </CardTitle>
              <CardDescription className="text-[#6b7280]">
                Товары, которые истекли или были удалены из магазина
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ExpiredItemsTable
                items={expiredItems}
                isLoading={isLoadingItems}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4 mt-4">
          <Card className="bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader>
              <CardTitle className="text-[#1f2937]">История продаж</CardTitle>
              <CardDescription className="text-[#6b7280]">
                Все проданные товары и детали транзакций
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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