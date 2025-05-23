'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Store,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Upload
} from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useDashboardStore } from '@/store/dashboard-store';
import { useStoreItemsStore } from '@/store/store-items-store';
import { formatCurrency } from '@/lib/utils';
import UploadFileButton from '@/components/dashboard/upload-file-button';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const { stats, fetchStats, isLoading } = useDashboardStore();
  const { fetchActiveItems, fetchReports } = useStoreItemsStore();
  
  useEffect(() => {
    const isLoggedIn = checkAuth();
    
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchStats();
      fetchActiveItems();
      fetchReports();
    }
  }, [checkAuth, fetchActiveItems, fetchReports, fetchStats, router]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-[#1f2937]">Добро пожаловать в Панель управления</h2>
        <div className="mt-2 sm:mt-0">
          <UploadFileButton />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1f2937]">Всего продуктов</CardTitle>
            <Package className="h-4 w-4 text-[#6b7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">{stats?.total_products || 0}</div>
            <p className="text-xs text-[#4b5563]">
              Продуктов в вашем инвентаре
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1f2937]">Продукты на складе</CardTitle>
            <Package className="h-4 w-4 text-[#6b7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">{stats?.products_in_warehouse || 0}</div>
            <p className="text-xs text-[#4b5563]">
              Продукты, доступные на складе
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1f2937]">Продукты в магазине</CardTitle>
            <Store className="h-4 w-4 text-[#6b7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">{stats?.products_in_store || 0}</div>
            <p className="text-xs text-[#4b5563]">
              Продукты, доступные для продажи
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#fffbeb] border-[#fcd34d]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#92400e]">Истекает срок</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#92400e]">{stats?.products_expiring_soon || 0}</div>
            <p className="text-xs text-[#92400e]">
              Продукты, истекающие в ближайшие 7 дней
            </p>
            {stats?.products_expiring_soon ? (
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#d97706]"
                onClick={() => router.push('/store')}
              >
                Показать истекающие товары →
              </Button>
            ) : null}
          </CardContent>
        </Card>
        
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1f2937]">Выручка (30 дней)</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#6b7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">
              {formatCurrency(stats?.total_revenue_last_30_days || 0)}
            </div>
            <p className="text-xs text-[#4b5563]">
              Общая выручка за последние 30 дней
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#1f2937]">Продажи (30 дней)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#6b7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">{stats?.total_sales_last_30_days || 0}</div>
            <p className="text-xs text-[#4b5563]">
              Всего товаров продано за последние 30 дней
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader>
            <CardTitle className="text-[#1f2937]">Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-[#4b5563]">
              {isLoading ? (
                "Загрузка данных активности..."
              ) : (
                "Нет последней активности"
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#ffffff] border-[#e5e7eb]">
          <CardHeader>
            <CardTitle className="text-[#1f2937]">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-between border-[#d1d5db] text-[#1f2937]"
              onClick={() => router.push('/warehouse')}
            >
              Загрузить новый инвентарь <Upload className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between border-[#d1d5db] text-[#1f2937]"
              onClick={() => router.push('/store')}
            >
              Управление товарами магазина <Store className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              className="w-full justify-between text-[#ffffff] bg-[#6322FE] hover:bg-[#5719d8]"
              onClick={() => router.push('/store')}
            >
              Продать товары <ShoppingCart className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}