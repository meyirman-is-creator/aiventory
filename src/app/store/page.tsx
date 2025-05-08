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
} from "@/redux/slices/storeSlice";
import { RootState, AppDispatch } from "@/redux/store";
import ActiveItemsTable from "@/components/store/active-items-table";
import ExpiredItemsTable from "@/components/store/expired-items-table";
import StoreStats from "@/components/store/store-stats";
import { useUserStore } from "@/store/user-store";

export default function StorePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, checkAuth } = useUserStore();

  const {
    activeItems,
    expiredItems,
    reports,
    isLoadingItems,
    isLoadingReports,
  } = useSelector((state: RootState) => state.store);

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      dispatch(fetchActiveItems());
      dispatch(fetchExpiredItems());
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
        <p className="text-[#4b5563]">
          Управляйте запасами магазина, просматривайте товары с истекающим
          сроком и регистрируйте продажи
        </p>
      </div>

      <StoreStats reports={reports} isLoading={isLoadingReports} />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#f3f4f6]">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
          >
            Активные товары
            <span className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#EBE3FF] text-[#6322FE]">
              {activeItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
          >
            Истекшие товары
            <span className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#FEE2E2] text-[#ef4444]">
              {expiredItems.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4 mt-4">
          <Card className="border-[#e5e7eb] bg-[#ffffff]">
            <CardHeader>
              <CardTitle className="text-[#1f2937]">
                Товары в магазине
              </CardTitle>
              <CardDescription className="text-[#4b5563]">
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
        <TabsContent value="expired" className="space-y-4 mt-4">
          <Card className="border-[#e5e7eb] bg-[#ffffff]">
            <CardHeader>
              <CardTitle className="text-[#1f2937]">
                Истекшие и удаленные товары
              </CardTitle>
              <CardDescription className="text-[#4b5563]">
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
      </Tabs>
    </div>
  );
}
