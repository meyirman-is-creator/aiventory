"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/store/user-store";
import { useWarehouseStore } from "@/store/warehouse-store";
import WarehouseItemsTable from "@/components/warehouse/items-table";
import ExpiringItemsTable from "@/components/warehouse/expiring-items-table";
import UploadFileButton from "@/components/dashboard/upload-file-button";
import MoveToStoreButton from "@/components/warehouse/move-to-store-button";
import { Loader } from "lucide-react";

const WarehousePage = () => {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchItems,
    fetchExpiringItems,
    items,
    expiringItems,
    isLoadingItems,
    isLoadingExpiringItems,
  } = useWarehouseStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isLoggedIn = checkAuth();

    const loadData = async () => {
      setIsInitialLoading(true);
      if (!isLoggedIn) {
        router.push("/auth/login");
      } else {
        try {
          await Promise.all([fetchItems(), fetchExpiringItems()]);
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    loadData();
  }, [checkAuth, fetchItems, fetchExpiringItems, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {isClient && (
        <div className="space-y-4 sm:space-y-6 relative px-2 sm:px-0">
          {(isInitialLoading || isLoadingItems || isLoadingExpiringItems) && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
              <div className="bg-[#ffffff] p-4 rounded-lg shadow-lg flex flex-col items-center">
                <Loader className="h-10 w-10 text-[#6322FE] animate-spin mb-2" />
                <p className="text-sm text-[#6b7280]">Загрузка данных...</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1f2937]">
                Управление складом
              </h2>
              <p className="text-sm sm:text-base text-[#6b7280] mt-1">
                Управляйте запасами на складе и перемещайте товары в магазин
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <MoveToStoreButton />
              <UploadFileButton />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#f3f4f6] h-auto p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937] text-xs sm:text-sm py-2"
              >
                <span className="hidden sm:inline">Все товары</span>
                <span className="sm:hidden">Все</span>
                <span
                  className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: "#EBE3FF",
                    color: "#6322FE",
                  }}
                >
                  {items.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="expiring"
                className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937] text-xs sm:text-sm py-2"
              >
                <span className="hidden sm:inline">Скоро истекают</span>
                <span className="sm:hidden">Истекают</span>
                <span
                  className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: "#FEF3C7",
                    color: "#f59e0b",
                  }}
                >
                  {expiringItems.length}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4 mt-4">
              <Card
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: "#ffffff",
                }}
              >
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-[#1f2937] text-lg sm:text-xl">
                    Товары на складе
                  </CardTitle>
                  <CardDescription className="text-[#6b7280] text-sm sm:text-base">
                    Все товары, которые в настоящее время хранятся на вашем
                    складе
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6 overflow-x-auto">
                  <WarehouseItemsTable
                    items={items}
                    isLoading={isLoadingItems}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="expiring" className="space-y-4 mt-4">
              <Card
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: "#ffffff",
                }}
              >
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-[#1f2937] text-lg sm:text-xl">
                    Товары с истекающим сроком
                  </CardTitle>
                  <CardDescription className="text-[#6b7280] text-sm sm:text-base">
                    Товары на складе, срок годности которых истекает в течение
                    ближайших 7 дней
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6 overflow-x-auto">
                  <ExpiringItemsTable
                    items={expiringItems}
                    isLoading={isLoadingExpiringItems}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default WarehousePage;