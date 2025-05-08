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

export default function WarehousePage() {
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

  // Добавляем состояние для отслеживания первичной загрузки данных
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
          // Загружаем данные параллельно
          await Promise.all([fetchItems(), fetchExpiringItems()]);
        } finally {
          // После загрузки данных отключаем индикатор загрузки
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
        <div className="space-y-6 relative">
          {/* Индикатор загрузки */}
          {(isInitialLoading || isLoadingItems || isLoadingExpiringItems) && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#ffffff]/70 z-50">
              <div className="bg-[#ffffff] p-4 rounded-lg shadow-lg flex flex-col items-center">
                <Loader className="h-10 w-10 text-[#6322FE] animate-spin mb-2" />
                <p className="text-sm text-[#4b5563]">Загрузка данных...</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1f2937]">
                Управление складом
              </h2>
              <p className="text-[#4b5563]">
                Управляйте запасами на складе и перемещайте товары в магазин
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
              <MoveToStoreButton />
              <UploadFileButton />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#f3f4f6]">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
              >
                Все товары
                <span
                  className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#EBE3FF] text-[#6322FE]"
                >
                  {items.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="expiring"
                className="data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#1f2937]"
              >
                Скоро истекают
                <span
                  className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#FEF3C7] text-[#f59e0b]"
                >
                  {expiringItems.length}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4 mt-4">
              <Card className="border-[#e5e7eb] bg-[#ffffff]">
                <CardHeader>
                  <CardTitle className="text-[#1f2937]">
                    Товары на складе
                  </CardTitle>
                  <CardDescription className="text-[#4b5563]">
                    Все товары, которые в настоящее время хранятся на вашем
                    складе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WarehouseItemsTable
                    items={items}
                    isLoading={isLoadingItems}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="expiring" className="space-y-4 mt-4">
              <Card className="border-[#e5e7eb] bg-[#ffffff]">
                <CardHeader>
                  <CardTitle className="text-[#1f2937]">
                    Товары с истекающим сроком
                  </CardTitle>
                  <CardDescription className="text-[#4b5563]">
                    Товары на складе, срок годности которых истекает в течение
                    ближайших 7 дней
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
}