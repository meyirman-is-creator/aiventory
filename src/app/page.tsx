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
  Activity,
  DollarSign,
  Users
} from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useDashboardStore } from '@/store/dashboard-store';
import { useStoreItemsStore } from '@/store/store-items-store';
import { formatCurrency } from '@/lib/utils';
import UploadFileButton from '@/components/dashboard/upload-file-button';
import AnalyticsCards from '@/components/dashboard/analytics-cards';
import QuickStats from '@/components/dashboard/quick-stats';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const { stats, fetchStats, isLoading } = useDashboardStore();
  const { fetchActiveItems, fetchReports, reports } = useStoreItemsStore();

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

  const statsData = [
    {
      title: "Всего продуктов",
      value: stats?.total_products || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      trend: "up"
    },
    {
      title: "На складе",
      value: stats?.products_in_warehouse || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      trend: "up"
    },
    {
      title: "В магазине",
      value: stats?.products_in_store || 0,
      icon: Store,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "-3%",
      trend: "down"
    },
    {
      title: "Истекает срок",
      value: stats?.products_expiring_soon || 0,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      isWarning: true,
      change: (stats?.products_expiring_soon ?? 0) > 0 ? "Требует внимания" : "Все в порядке",
      trend: "neutral" as const
    }
  ];

  const kpiData = [
    {
      title: "Выручка (30 дней)",
      value: formatCurrency(stats?.total_revenue_last_30_days || 0),
      icon: DollarSign,
      change: "+23.5%",
      trend: "up" as const
    },
    {
      title: "Продажи (30 дней)",
      value: stats?.total_sales_last_30_days || 0,
      icon: ShoppingCart,
      change: "+18.2%",
      trend: "up" as const
    },
    {
      title: "Средний чек",
      value: formatCurrency(
        stats?.total_sales_last_30_days && stats.total_sales_last_30_days > 0
          ? stats.total_revenue_last_30_days / stats.total_sales_last_30_days
          : 0
      ),
      icon: Activity,
      change: "+5.3%",
      trend: "up" as const
    },
    {
      title: "Конверсия",
      value: "68%",
      icon: Users,
      change: "+2.1%",
      trend: "up" as const
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Панель управления
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Добро пожаловать в систему управления запасами
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <UploadFileButton />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`relative overflow-hidden ${stat.isWarning ? 'border-amber-200' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <p className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                {stat.isWarning && stat.value > 0 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-amber-600 text-xs mt-2"
                    onClick={() => router.push('/store')}
                  >
                    Показать товары →
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AnalyticsCards reports={reports} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-3">
          <QuickStats data={kpiData} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/warehouse')}
            >
              <Package className="mr-2 h-4 w-4" />
              Управление складом
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/store')}
            >
              <Store className="mr-2 h-4 w-4" />
              Управление магазином
            </Button>
            <Button
              className="w-full justify-start bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push('/store')}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Новая продажа
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Недавняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports?.sales?.slice(0, 5).map((sale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {sale.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.category_name} • {sale.quantity} шт
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(sale.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-8">
                  Нет недавней активности
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}