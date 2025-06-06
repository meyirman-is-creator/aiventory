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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { useWarehouseStore } from "@/store/warehouse-store";
import WarehouseItemsTable from "@/components/warehouse/items-table";
import UploadFileButton from "@/components/dashboard/upload-file-button";
import MoveToStoreButton from "@/components/warehouse/move-to-store-button";
import { Loader, Search, Package, Trash2 } from "lucide-react";
import { UrgencyLevel, WarehouseItemStatus } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WarehousePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchItems,
    items,
    filteredItems,
    totalCount,
    isLoadingItems,
    isDeleting,
    setFilter,
    resetFilters,
    selectedItems,
    deleteSelectedItems,
    clearSelection,
  } = useWarehouseStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categories = items.reduce((acc, item) => {
    if (item.product.category) {
      const existing = acc.find(cat => cat.sid === item.product.category!.sid);
      if (!existing) {
        acc.push({
          sid: item.product.category.sid,
          name: item.product.category.name,
        });
      }
    }
    return acc;
  }, [] as Array<{ sid: string; name: string }>);

  useEffect(() => {
    setIsClient(true);
    const isLoggedIn = checkAuth();

    const loadData = async () => {
      setIsInitialLoading(true);
      if (!isLoggedIn) {
        router.push("/auth/login");
      } else {
        try {
          await fetchItems();
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    loadData();
  }, [checkAuth, fetchItems, router]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilter('search', value);
  };

  const handleCategoryFilter = (value: string) => {
    const newCategory = value === "all" ? null : value;
    setFilter('category_sid', newCategory);
  };

  const handleStatusFilter = (value: string) => {
    const newStatus = value === "all" ? null : value as WarehouseItemStatus;
    setFilter('status', newStatus);
  };

  const handleUrgencyFilter = (value: string) => {
    const newUrgency = value === "all" ? null : value as UrgencyLevel;
    setFilter('urgency_level', newUrgency);
  };

  const handleDeleteSelected = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteSelectedItems();
      toast({
        title: "Успех",
        description: `Удалено ${selectedItems.size} товаров`,
      });
      clearSelection();
    } catch  {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товары",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {isClient && (
        <div className="space-y-4 sm:space-y-6 relative space-y-6 !p-4 sm:px-0">
          {(isInitialLoading || isLoadingItems) && (
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
              <div className="flex items-center gap-2 mt-2">
                <Package className="h-5 w-5 text-[#6322FE]" />
                <span className="text-sm font-semibold text-[#1f2937]">
                  Всего товаров на складе: {totalCount}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#6b7280]" />
                <Input
                  placeholder="Поиск по названию..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.sid} value={category.sid}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="in_stock">На складе</SelectItem>
                  <SelectItem value="moved">Перемещен</SelectItem>
                  <SelectItem value="discarded">Списан</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все уровни срочности" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                  <SelectItem value="normal">Обычный</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <MoveToStoreButton />
              <UploadFileButton />
              {selectedItems.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить выбранные ({selectedItems.size})
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-1 bg-[#f3f4f6] h-auto p-1">
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
                  {filteredItems.length}
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
                    items={filteredItems}
                    isLoading={isLoadingItems}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить {selectedItems.size} выбранных товаров?
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
};

export default WarehousePage;