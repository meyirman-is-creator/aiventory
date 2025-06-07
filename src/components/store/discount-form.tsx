"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { StoreItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createDiscount } from "@/redux/slices/storeSlice";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Info, TrendingDown, DollarSign } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { AppDispatch } from "@/redux/store";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DiscountModalProps {
  item: StoreItem;
  open: boolean;
  onClose: () => void;
}

const DiscountModal = ({ item, open, onClose }: DiscountModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [percentage, setPercentage] = useState("10");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const originalPrice = item.price;
  const basePrice = item.product.default_price || originalPrice * 0.7;
  const percentageValue = parseInt(percentage) || 0;
  const discountedPrice = originalPrice * (1 - percentageValue / 100);
  const profitMargin = ((discountedPrice - basePrice) / basePrice) * 100;
  const customerSavings = originalPrice - discountedPrice;

  const getRecommendedDiscount = () => {
    if (!item.days_until_expiry) return 10;
    if (item.days_until_expiry <= 1) return 40;
    if (item.days_until_expiry <= 3) return 35;
    if (item.days_until_expiry <= 5) return 30;
    if (item.days_until_expiry <= 7) return 25;
    if (item.days_until_expiry <= 14) return 20;
    if (item.days_until_expiry <= 21) return 15;
    return 10;
  };

  const recommendedDiscount = getRecommendedDiscount();

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setPercentage("");
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setPercentage(value);
    }
  };

  const handleSubmit = async () => {
    const percentageValue = parseInt(percentage) || 0;
    
    if (percentageValue <= 0 || percentageValue > 100) {
      toast({
        title: "Неверная скидка",
        description: "Пожалуйста, введите процент скидки от 1 до 100",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Неверный период",
        description: "Дата окончания должна быть после даты начала",
        variant: "destructive",
      });
      return;
    }

    if (profitMargin < 5) {
      const confirm = window.confirm(
        `Прибыль составит всего ${profitMargin.toFixed(1)}%. Вы уверены, что хотите установить такую скидку?`
      );
      if (!confirm) return;
    }

    setIsLoading(true);

    try {
      await dispatch(
        createDiscount({
          storeItemSid: item.sid,
          percentage: percentageValue,
          startsAt: startDate,
          endsAt: endDate,
        })
      ).unwrap();

      toast({
        title: "Скидка создана",
        description: `Скидка ${percentageValue}% добавлена к ${item.product.name}`,
      });
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось создать скидку";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#ffffff]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-[#1f2937] text-base sm:text-lg">Настройка скидки</DialogTitle>
          <DialogDescription className="text-[#6b7280] text-xs sm:text-sm">
            Установите скидку для {item.product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2">
          <div className="bg-[#f9fafb] p-3 sm:p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-[#1f2937] text-sm sm:text-base">{item.product.name}</h4>
                {item.product.category && (
                  <p className="text-xs sm:text-sm text-[#6b7280]">
                    {item.product.category.name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-[#6b7280]">Текущая цена</p>
                <p className="font-medium text-[#1f2937] text-sm sm:text-base">
                  {formatCurrency(originalPrice)}
                </p>
              </div>
            </div>

            {item.days_until_expiry !== null && item.days_until_expiry !== undefined && (
              <Alert className={
                item.days_until_expiry <= 3 ? "border-[#fecaca] bg-[#fee2e2]" :
                  item.days_until_expiry <= 7 ? "border-[#fed7aa] bg-[#fff7ed]" :
                    "border-[#e5e7eb] bg-[#f9fafb]"
              }>
                <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertDescription className={cn(
                  "text-xs sm:text-sm",
                  item.days_until_expiry <= 3 ? "text-[#7f1d1d]" :
                    item.days_until_expiry <= 7 ? "text-[#7c2d12]" :
                      "text-[#374151]"
                )}>
                  {item.days_until_expiry === 0 ? "Срок годности истекает сегодня!" :
                    item.days_until_expiry === 1 ? "Срок годности истекает завтра!" :
                      `До истечения срока годности: ${item.days_until_expiry} дн.`}
                  {recommendedDiscount > 0 && (
                    <span className="block mt-0.5 sm:mt-1">
                      Рекомендуемая скидка: <strong>{recommendedDiscount}%</strong>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="percentage" className="text-[#374151] text-sm">
                Процент скидки
              </Label>
              {recommendedDiscount > 0 && percentage !== recommendedDiscount.toString() && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setPercentage(recommendedDiscount.toString())}
                  className="text-[#6322FE] h-auto p-0 text-xs"
                >
                  Использовать рекомендуемый ({recommendedDiscount}%)
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={handlePercentageChange}
                min={0}
                max={100}
                className="w-20 sm:w-24 border-[#e5e7eb] text-[#1f2937] text-sm"
              />
              <span className="text-[#6b7280] text-sm">%</span>
            </div>
          </div>

          <div className="bg-[#f3f4f6] p-3 sm:p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-[#1f2937] flex items-center text-sm sm:text-base">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Расчет цены
            </h4>

            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Текущая цена:</span>
                <span className="text-[#374151]">{formatCurrency(originalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Скидка ({percentageValue}%):</span>
                <span className="text-[#ef4444]">-{formatCurrency(customerSavings)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1.5 sm:pt-2">
                <span className="text-[#1f2937]">Цена со скидкой:</span>
                <span className="text-[#1f2937]">{formatCurrency(discountedPrice)}</span>
              </div>
            </div>

            <div className="border-t pt-2 sm:pt-3 space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[#6b7280]">Закупочная цена:</span>
                <span className="text-[#374151]">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-xs sm:text-sm font-medium ${profitMargin < 10 ? 'text-[#ef4444]' : 'text-[#059669]'}`}>
                  Прибыль:
                </span>
                <span className={`font-medium text-sm ${profitMargin < 10 ? 'text-[#ef4444]' : 'text-[#059669]'}`}>
                  {profitMargin.toFixed(1)}% ({formatCurrency(discountedPrice - basePrice)})
                </span>
              </div>
            </div>

            {profitMargin < 10 && (
              <Alert className="border-[#fecaca] bg-[#fee2e2]">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-[#ef4444]" />
                <AlertDescription className="text-[#7f1d1d] text-xs sm:text-sm">
                  Низкая маржа! Рекомендуется поддерживать прибыль не менее 10%
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-[#374151] text-sm">Дата начала</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-[#e5e7eb] text-[#374151] text-sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {format(startDate, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#ffffff]">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setIsStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-[#374151] text-sm">Дата окончания</Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-[#e5e7eb] text-[#374151] text-sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {format(endDate, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#ffffff]">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setIsEndDateOpen(false);
                      }
                    }}
                    initialFocus
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] text-sm"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff] text-sm"
            onClick={handleSubmit}
            disabled={isLoading || !percentage || parseInt(percentage) === 0}
          >
            {isLoading ? "Создание..." : "Создать скидку"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;