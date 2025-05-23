import { StoreReports } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, AlertTriangle, Percent } from 'lucide-react';

interface StoreStatsProps {
  reports: StoreReports | null;
  isLoading: boolean;
}

const StoreStats = ({ reports, isLoading }: StoreStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b7280]">Загрузка...</CardTitle>
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
      <Card className="bg-[#ffffff] border-[#e5e7eb]">
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
      
      <Card className="bg-[#ffffff] border-[#e5e7eb]">
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
      
      <Card className="border-[#fecaca] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#7f1d1d]">Потери по сроку</CardTitle>
          <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#7f1d1d]">{formatCurrency(summary.total_expired_value)}</div>
          <p className="text-xs text-[#7f1d1d]">
            Стоимость истекших товаров
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-[#c4b5fd] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#4c1d95]">Экономия по скидкам</CardTitle>
          <Percent className="h-4 w-4 text-[#6322FE]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#4c1d95]">{formatCurrency(summary.total_discount_savings)}</div>
          <p className="text-xs text-[#4c1d95]">
            Экономия клиентов по скидкам
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreStats;