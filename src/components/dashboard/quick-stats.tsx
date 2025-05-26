"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface QuickStatsProps {
  data: Array<{
    title: string;
    value: string | number;
    icon: LucideIcon;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  }>;
}

const QuickStats = ({ data }: QuickStatsProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ключевые показатели</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {data.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {stat.trend === 'up' && (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
                    </>
                  )}
                  {stat.trend === 'down' && (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600">{stat.change}</span>
                    </>
                  )}
                  {stat.trend === 'neutral' && (
                    <>
                      <Minus className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">{stat.change}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;