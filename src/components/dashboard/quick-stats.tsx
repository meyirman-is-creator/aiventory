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
    <Card className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0 p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base md:text-lg">Ключевые показатели</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-3 sm:p-4 md:p-6 pt-0">
        <div className="grid gap-2 sm:gap-3">
          {data.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{stat.title}</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">{stat.value}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {stat.trend === 'up' && (
                    <>
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-500 mr-0.5 sm:mr-1" />
                      <span className="text-[10px] sm:text-xs md:text-sm text-green-600">{stat.change}</span>
                    </>
                  )}
                  {stat.trend === 'down' && (
                    <>
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-red-500 mr-0.5 sm:mr-1" />
                      <span className="text-[10px] sm:text-xs md:text-sm text-red-600">{stat.change}</span>
                    </>
                  )}
                  {stat.trend === 'neutral' && (
                    <>
                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-gray-500 mr-0.5 sm:mr-1" />
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">{stat.change}</span>
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