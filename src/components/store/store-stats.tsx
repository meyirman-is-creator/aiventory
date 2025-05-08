import { StoreReports } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Clock, AlertTriangle, Percent } from 'lucide-react';

interface StoreStatsProps {
  reports: StoreReports | null;
  isLoading: boolean;
}

const StoreStats = ({ reports, isLoading }: StoreStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-[#e5e7eb] bg-[#ffffff]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f2937]">Загрузка...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-[#e5e7eb] rounded w-24"></div>
              <div className="h-4 bg-[#e5e7eb] rounded w-32 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!reports) {
    return null;
  }
  
  const { summary } = reports;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-[#e5e7eb] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#1f2937]">Всего продаж</CardTitle>
          <ShoppingCart className="h-4 w-4 text-[#6b7280]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#1f2937]">{summary.total_items_sold}</div>
          <p className="text-xs text-[#6b7280]">
            Товаров продано за 30 дней
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-[#e5e7eb] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#1f2937]">Выручка</CardTitle>
          <ShoppingCart className="h-4 w-4 text-[#6b7280]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#1f2937]">{formatCurrency(summary.total_sales)}</div>
          <p className="text-xs text-[#6b7280]">
            Выручка за 30 дней
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-[#fca5a5] bg-[#fff1f2]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#b91c1c]">Потери по сроку</CardTitle>
          <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#b91c1c]">{formatCurrency(summary.total_expired_value)}</div>
          <p className="text-xs text-[#b91c1c]">
            Стоимость истекших товаров
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-[#c4b5fd] bg-[#f5f3ff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#6d28d9]">Экономия по скидкам</CardTitle>
          <Percent className="h-4 w-4 text-[#8b5cf6]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#6d28d9]">{formatCurrency(summary.total_discount_savings)}</div>
          <p className="text-xs text-[#6d28d9]">
            Экономия клиентов по скидкам
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreStats;