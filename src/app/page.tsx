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
  TrendingDown,
  Minus,
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
import TopProductsChart from '@/components/dashboard/top-products-chart';
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
      // Загружаем данные без кэширования
      const loadData = async () => {
        await Promise.all([
          fetchStats(),
          fetchActiveItems(),
          fetchReports()
        ]);
      };
      
      loadData();
      
      // Обновляем данные каждые 30 секунд
      const interval = setInterval(() => {
        loadData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [checkAuth, fetchActiveItems, fetchReports, fetchStats, router]);

  if (!isAuthenticated) {
    return null;
  }

  const getChangeValue = (value?: number) => {
    if (value === undefined || value === null) return { text: "0%", trend: "neutral" as const };
    const sign = value > 0 ? "+" : "";
    return {
      text: `${sign}${value.toFixed(1)}%`,
      trend: value > 5 ? "up" as const : value < -5 ? "down" as const : "neutral" as const
    };
  };

  const statsData = [
    {
      title: "Всего продуктов",
      value: stats?.total_products || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: getChangeValue(0).text,
      trend: "neutral" as const
    },
    {
      title: "На складе",
      value: stats?.products_in_warehouse || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: getChangeValue(0).text,
      trend: getChangeValue(0).trend
    },
    {
      title: "В магазине",
      value: stats?.products_in_store || 0,
      icon: Store,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: getChangeValue(0).text,
      trend: getChangeValue(0).trend
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
      change: getChangeValue(stats?.revenue_change).text,
      trend: getChangeValue(stats?.revenue_change).trend
    },
    {
      title: "Продажи (30 дней)",
      value: stats?.total_sales_last_30_days || 0,
      icon: ShoppingCart,
      change: getChangeValue(stats?.sales_change).text,
      trend: getChangeValue(stats?.sales_change).trend
    },
    {
      title: "Средний чек",
      value: formatCurrency(stats?.avg_check || 0),
      icon: Activity,
      change: getChangeValue(stats?.avg_check_change).text,
      trend: getChangeValue(stats?.avg_check_change).trend
    },
    {
      title: "Конверсия",
      value: `${stats?.conversion_rate || 0}%`,
      icon: Users,
      change: getChangeValue(stats?.conversion_change).text,
      trend: getChangeValue(stats?.conversion_change).trend
    }
  ];

  return (
    <div className="space-y-6 !p-4 md:p-6 lg:p-8">
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
            <Card key={index} className={`relative overflow-hidden ${stat.isWarning && stat.value > 0 ? 'border-amber-200' : ''}`}>
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
                  {stat.trend === 'down' && (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {stat.trend === 'neutral' && !stat.isWarning && (
                    <Minus className="h-4 w-4 text-gray-500 mr-1" />
                  )}
                  <p className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    stat.isWarning && stat.value > 0 ? 'text-amber-600' :
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
          <AnalyticsCards stats={stats} reports={reports} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-3">
          <QuickStats data={kpiData} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <TopProductsChart data={stats?.top_products || []} isLoading={isLoading} />
        
        <Card>
          <CardHeader>
            <CardTitle>Недавняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports?.sales && reports.sales.length > 0 ? (
                reports.sales.slice(0, 5).map((sale, index) => (
                  <div key={`${sale.date}-${sale.product_name}-${index}`} className="flex items-center justify-between">
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
                ))
              ) : (
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