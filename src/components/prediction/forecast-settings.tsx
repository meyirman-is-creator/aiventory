"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { usePredictionStore } from "@/store/prediction-store";
import { TimeFrame } from "@/lib/types";
import { Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const ForecastSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedTimeframe,
    selectedPeriods,
    setSelectedTimeframe,
    setSelectedPeriods,
  } = usePredictionStore();

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value as TimeFrame);
  };

  const handlePeriodsChange = (value: string) => {
    setSelectedPeriods(parseInt(value));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeframe">Time Frame</Label>
            <Select
              value={selectedTimeframe}
              onValueChange={handleTimeframeChange}
            >
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeFrame.DAY}>Day</SelectItem>
                <SelectItem value={TimeFrame.WEEK}>Week</SelectItem>
                <SelectItem value={TimeFrame.MONTH}>Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="periods">Number of Periods</Label>
            <Select
              value={selectedPeriods.toString()}
              onValueChange={handlePeriodsChange}
            >
              <SelectTrigger id="periods">
                <SelectValue placeholder="Select number of periods" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            {selectedTimeframe === TimeFrame.DAY && (
              <p>
                Forecasting for the next {selectedPeriods} day
                {selectedPeriods > 1 ? "s" : ""}
              </p>
            )}
            {selectedTimeframe === TimeFrame.WEEK && (
              <p>
                Forecasting for the next {selectedPeriods} week
                {selectedPeriods > 1 ? "s" : ""}
              </p>
            )}
            {selectedTimeframe === TimeFrame.MONTH && (
              <p>
                Forecasting for the next {selectedPeriods} month
                {selectedPeriods > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ForecastSettings;
