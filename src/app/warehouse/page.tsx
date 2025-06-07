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
import { Loader, Search, Package, Trash2, AlertTriangle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("all");

  const activeItems = filteredItems.filter(item => !item.is_expired && item.status === "in_stock");
  const expiredItems = filteredItems.filter(item => item.is_expired);

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
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {(isInitialLoading || isLoadingItems) && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col items-center">
                <Loader className="h-8 w-8 sm:h-10 sm:w-10 text-[#6322FE] animate-spin mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">Загрузка данных...</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                Управление складом
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                Управляйте запасами на складе и перемещайте товары в магазин
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#6322FE]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  Всего товаров на складе: {totalCount}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Поиск..."
                  value={searchValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                  className="pl-10 h-9 sm:h-10 text-sm"
                />
              </div>

              <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger className="h-9 sm:h-10 text-sm">
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
                <SelectTrigger className="h-9 sm:h-10 text-sm">
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
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue placeholder="Срочность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                  <SelectItem value="normal">Обычный</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-9 sm:h-10 text-sm"
              >
                Сбросить
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <MoveToStoreButton />
              <UploadFileButton />
              {selectedItems.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Удалить ({selectedItems.size})
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-auto p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 py-1.5 sm:py-2 text-xs sm:text-sm"
              >
                <span>Активные товары</span>
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-semibold bg-[#6322FE]/10 text-[#6322FE]">
                  {activeItems.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="expired"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 py-1.5 sm:py-2 text-xs sm:text-sm"
              >
                <span>Истек срок</span>
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
                  {expiredItems.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4 sm:mt-6">
              <Card className="border-gray-200">
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="text-gray-900 text-base sm:text-lg lg:text-xl">
                    Товары на складе
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-xs sm:text-sm">
                    Все товары, которые в настоящее время хранятся на вашем складе
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6 pb-4">
                  <WarehouseItemsTable
                    items={activeItems}
                    isLoading={isLoadingItems}
                    showExpired={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expired" className="space-y-4 mt-4 sm:mt-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="text-gray-900 text-base sm:text-lg lg:text-xl flex items-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2" />
                    Товары с истекшим сроком годности
                  </CardTitle>
                  <CardDescription className="text-red-700 text-xs sm:text-sm">
                    Эти товары нельзя переместить в магазин. Рекомендуется списать их.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6 pb-4">
                  <WarehouseItemsTable
                    items={expiredItems}
                    isLoading={isLoadingItems}
                    showExpired={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent className="w-[90%] sm:w-full max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Вы уверены, что хотите удалить {selectedItems.size} выбранных товаров?
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-sm">Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm"
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