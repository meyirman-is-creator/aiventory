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
import { formatCurrency, calculateDiscountPrice } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { AppDispatch } from "@/redux/store";

interface DiscountModalProps {
  item: StoreItem;
  open: boolean;
  onClose: () => void;
}

const DiscountModal = ({ item, open, onClose }: DiscountModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [percentage, setPercentage] = useState(10);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const originalPrice = item.price;
  const discountedPrice = calculateDiscountPrice(originalPrice, percentage);

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      setPercentage(0);
    } else if (value > 100) {
      setPercentage(100);
    } else {
      setPercentage(value);
    }
  };

  const handleSubmit = async () => {
    if (percentage <= 0 || percentage > 100) {
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

    setIsLoading(true);

    try {
      await dispatch(
        createDiscount({
          storeItemSid: item.sid,
          percentage,
          startsAt: startDate,
          endsAt: endDate,
        })
      ).unwrap();

      toast({
        title: "Скидка создана",
        description: `Скидка ${percentage}% добавлена к ${item.product.name}`,
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
      <DialogContent className="sm:max-w-md bg-[#ffffff]">
        <DialogHeader>
          <DialogTitle className="text-[#1f2937]">Добавить скидку</DialogTitle>
          <DialogDescription className="text-[#6b7280]">
            Создать скидку для {item.product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#374151]">Товар</Label>
            <div className="text-sm font-medium text-[#1f2937]">{item.product.name}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#374151]">Исходная цена</Label>
            <div className="text-sm font-medium text-[#1f2937]">
              {formatCurrency(originalPrice)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage" className="text-[#374151]">Процент скидки</Label>
            <div className="flex items-center">
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={handlePercentageChange}
                min={0}
                max={100}
                className="w-20 mr-2 border-[#e5e7eb] text-[#1f2937]"
              />
              <span className="text-[#6b7280]">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#374151]">Цена со скидкой</Label>
            <div className="text-lg font-bold text-[#6322FE]">
              {formatCurrency(discountedPrice)}
            </div>
            <div className="text-xs text-[#6b7280]">
              Клиент экономит {formatCurrency(originalPrice - discountedPrice)}{" "}
              за единицу
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-[#374151]">Дата начала</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-[#e5e7eb] text-[#374151]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
              <Label htmlFor="endDate" className="text-[#374151]">Дата окончания</Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-[#e5e7eb] text-[#374151]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Создание..." : "Создать скидку"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;