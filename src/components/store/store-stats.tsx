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
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Загрузка...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mt-2"></div>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего продаж</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_items_sold}</div>
          <p className="text-xs text-muted-foreground">
            Товаров продано за 30 дней
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Выручка</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_sales)}</div>
          <p className="text-xs text-muted-foreground">
            Выручка за 30 дней
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Потери по сроку</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_expired_value)}</div>
          <p className="text-xs text-muted-foreground">
            Стоимость истекших товаров
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Экономия по скидкам</CardTitle>
          <Percent className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_discount_savings)}</div>
          <p className="text-xs text-muted-foreground">
            Экономия клиентов по скидкам
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreStats;