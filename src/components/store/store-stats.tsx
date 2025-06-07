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
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-[#ffffff] border-[#e5e7eb]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-[#6b7280]">Загрузка...</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="h-5 sm:h-6 bg-[#e5e7eb] rounded w-20 sm:w-24"></div>
              <div className="h-3 sm:h-4 bg-[#e5e7eb] rounded w-24 sm:w-32 mt-2"></div>
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
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="bg-[#ffffff] border-[#e5e7eb]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#1f2937]">Всего продаж</CardTitle>
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-[#6b7280]" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-base sm:text-lg lg:text-2xl font-bold text-[#1f2937]">{summary.total_items_sold}</div>
          <p className="text-xs text-[#6b7280] mt-0.5 sm:mt-1">
            Товаров продано за 30 дней
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-[#ffffff] border-[#e5e7eb]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#1f2937]">Выручка</CardTitle>
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-[#6b7280]" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-base sm:text-lg lg:text-2xl font-bold text-[#1f2937]">{formatCurrency(summary.total_sales)}</div>
          <p className="text-xs text-[#6b7280] mt-0.5 sm:mt-1">
            Выручка за 30 дней
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-[#fecaca] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#7f1d1d]">Потери</CardTitle>
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-[#ef4444]" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-base sm:text-lg lg:text-2xl font-bold text-[#7f1d1d]">{formatCurrency(summary.total_removed_value)}</div>
          <p className="text-xs text-[#7f1d1d] mt-0.5 sm:mt-1">
            Стоимость убранных товаров
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-[#c4b5fd] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#4c1d95]">Экономия</CardTitle>
          <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-[#6322FE]" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-base sm:text-lg lg:text-2xl font-bold text-[#4c1d95]">{formatCurrency(summary.total_discount_savings)}</div>
          <p className="text-xs text-[#4c1d95] mt-0.5 sm:mt-1">
            Экономия по скидкам
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreStats;