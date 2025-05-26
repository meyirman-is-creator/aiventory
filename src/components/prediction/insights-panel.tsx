"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Prediction } from "@/lib/types";

interface Analytics {
  trends?: {
    trend?: string;
    growth?: {
      quantity?: number;
      revenue?: number;
    };
  };
  kpis?: {
    turnover_rate?: number;
    days_of_supply?: number;
    avg_monthly_sales?: number;
    avg_monthly_revenue?: number;
  };
  inventory?: {
    nearest_expiry?: string;
  };
}

interface InsightsPanelProps {
  analytics: Analytics;
  predictions: Prediction[];
}

const InsightsPanel = ({ analytics, predictions }: InsightsPanelProps) => {
  if (!analytics) return null;

  const generateInsights = () => {
    const insights = [];
    const trends = analytics.trends || {};
    const kpis = analytics.kpis || {};
    
    if (trends.trend === 'strong_growth') {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Сильный рост продаж',
        description: `Продажи растут на ${trends.growth?.quantity?.toFixed(1)}% по количеству и ${trends.growth?.revenue?.toFixed(1)}% по выручке`,
        recommendation: 'Увеличьте запасы для удовлетворения растущего спроса'
      });
    } else if (trends.trend === 'decline') {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Снижение продаж',
        description: `Продажи снизились на ${Math.abs(trends.growth?.quantity || 0).toFixed(1)}%`,
        recommendation: 'Рассмотрите возможность промоакций или изменения ценовой политики'
      });
    }

    if (kpis.turnover_rate && kpis.turnover_rate < 0.5) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Низкая оборачиваемость',
        description: `Текущая оборачиваемость ${(kpis.turnover_rate * 100).toFixed(1)}% ниже оптимальной`,
        recommendation: 'Снизьте объем заказов или проведите акцию для ускорения продаж'
      });
    }

    if (kpis.days_of_supply && kpis.days_of_supply > 30) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Избыточные запасы',
        description: `Запасов хватит на ${Math.round(kpis.days_of_supply)} дней`,
        recommendation: 'Приостановите новые поставки до снижения уровня запасов'
      });
    } else if (kpis.days_of_supply && kpis.days_of_supply < 7) {
      insights.push({
        type: 'error',
        icon: XCircle,
        title: 'Критически низкие запасы',
        description: `Запасов осталось на ${Math.round(kpis.days_of_supply)} дней`,
        recommendation: 'Срочно закажите новую партию товара'
      });
    }

    if (predictions.length > 0) {
      const nextPeriodForecast = predictions[0].forecast_qty;
      const avgMonthlySales = kpis.avg_monthly_sales || 0;
      
      if (nextPeriodForecast > avgMonthlySales * 1.5) {
        insights.push({
          type: 'info',
          icon: TrendingUp,
          title: 'Ожидается рост спроса',
          description: `Прогноз на следующий период: ${Math.round(nextPeriodForecast)} единиц`,
          recommendation: 'Подготовьтесь к увеличению спроса, проверьте запасы'
        });
      }
    }

    if (analytics.inventory?.nearest_expiry) {
      const daysUntilExpiry = Math.ceil(
        (new Date(analytics.inventory.nearest_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry <= 7) {
        insights.push({
          type: 'error',
          icon: AlertCircle,
          title: 'Товары с истекающим сроком',
          description: `Ближайший срок истечения через ${daysUntilExpiry} дней`,
          recommendation: 'Проведите акцию или переместите товары на видное место'
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Аналитические инсайты</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Все показатели в норме. Продолжайте следить за динамикой.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Аналитические инсайты</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Alert
                key={index}
                variant={insight.type === 'error' ? 'destructive' : 'default'}
                className={
                  insight.type === 'success' ? 'border-green-200 bg-green-50' :
                  insight.type === 'warning' ? 'border-amber-200 bg-amber-50' :
                  insight.type === 'info' ? 'border-blue-200 bg-blue-50' : ''
                }
              >
                <Icon className={`h-5 w-5 ${
                  insight.type === 'success' ? 'text-green-600' :
                  insight.type === 'warning' ? 'text-amber-600' :
                  insight.type === 'info' ? 'text-blue-600' :
                  'text-red-600'
                }`} />
                <div className="ml-3 flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {insight.recommendation}
                  </Badge>
                </div>
              </Alert>
            );
          })}
        </div>

        {analytics.kpis && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Средние продажи</p>
              <p className="text-lg font-semibold">
                {Math.round(analytics.kpis.avg_monthly_sales || 0)} / мес
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Оборачиваемость</p>
              <p className="text-lg font-semibold">
                {((analytics.kpis.turnover_rate || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Запас дней</p>
              <p className="text-lg font-semibold">
                {Math.round(analytics.kpis.days_of_supply || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Средняя выручка</p>
              <p className="text-lg font-semibold">
                {formatCurrency(analytics.kpis.avg_monthly_revenue || 0)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;