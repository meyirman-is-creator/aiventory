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
import { recordSale } from "@/redux/slices/storeSlice";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Package, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppDispatch } from "@/redux/store";

interface SellItemModalProps {
  item: StoreItem;
  open: boolean;
  onClose: () => void;
}

const SellItemModal = ({ item, open, onClose }: SellItemModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState("1");
  const [customPrice, setCustomPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const hasDiscount =
    item.current_discounts && item.current_discounts.length > 0;
  const discountPercentage = hasDiscount
    ? item.current_discounts[0].percentage
    : 0;
  const defaultPrice = hasDiscount
    ? item.price * (1 - discountPercentage / 100)
    : item.price;
  
  const pricePerUnit = customPrice ? parseFloat(customPrice) : defaultPrice;
  const totalPrice = pricePerUnit * (parseInt(quantity) || 0);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity("");
      return;
    }
    const intValue = parseInt(value);
    if (!isNaN(intValue) && intValue >= 0 && intValue <= item.quantity) {
      setQuantity(value);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setCustomPrice("");
      return;
    }
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue) && floatValue >= 0) {
      setCustomPrice(value);
    }
  };

  const incrementQuantity = () => {
    const currentQty = quantity === "" ? 0 : parseInt(quantity);
    if (currentQty < item.quantity) {
      setQuantity((currentQty + 1).toString());
    }
  };

  const decrementQuantity = () => {
    const currentQty = quantity === "" ? 0 : parseInt(quantity);
    if (currentQty > 0) {
      setQuantity((currentQty - 1).toString());
    }
  };

  const handleSubmit = async () => {
    const qty = parseInt(quantity) || 0;
    
    if (qty < 1 || qty > item.quantity) {
      toast({
        title: "Неверное количество",
        description: `Пожалуйста, введите количество от 1 до ${item.quantity}`,
        variant: "destructive",
      });
      return;
    }

    if (pricePerUnit <= 0) {
      toast({
        title: "Неверная цена",
        description: "Цена должна быть больше 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(
        recordSale({
          storeItemSid: item.sid,
          soldQty: qty,
          soldPrice: pricePerUnit,
        })
      ).unwrap();

      toast({
        title: "Продажа зарегистрирована",
        description: `Успешно продано ${qty} ${item.product.name}`,
      });
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось зарегистрировать продажу";
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
      <DialogContent className="w-[95%] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#ffffff]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-[#1f2937] text-base sm:text-lg">Продажа товара</DialogTitle>
          <DialogDescription className="text-[#6b7280] text-xs sm:text-sm">
            Оформление продажи товара
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2">
          <div className="bg-[#f9fafb] p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="font-medium text-[#1f2937] text-sm sm:text-base">{item.product.name}</h4>
                {item.product.category && (
                  <p className="text-xs sm:text-sm text-[#6b7280]">
                    Категория: {item.product.category.name}
                  </p>
                )}
                {item.batch_code && (
                  <p className="text-xs text-[#9ca3af]">
                    Партия: {item.batch_code}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                В наличии: {item.quantity}
              </Badge>
            </div>

            {item.expire_date && (
              <div className="flex items-center text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#6b7280]" />
                <span className="text-[#374151]">
                  Срок годности: {new Date(item.expire_date).toLocaleDateString()}
                </span>
                {item.days_until_expiry !== null && item.days_until_expiry !== undefined && item.days_until_expiry <= 7 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 text-xs"
                  >
                    Истекает через {item.days_until_expiry} дн.
                  </Badge>
                )}
              </div>
            )}

            {item.product.barcode && (
              <div className="flex items-center text-xs sm:text-sm">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#6b7280]" />
                <span className="text-[#374151]">
                  Штрихкод: {item.product.barcode}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-[#374151] text-sm font-medium">
              Количество
            </Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-r-none border-[#e5e7eb]"
                onClick={decrementQuantity}
                disabled={quantity === "0" || quantity === ""}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={0}
                max={item.quantity}
                className="h-8 w-16 sm:w-20 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] font-medium text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-l-none border-[#e5e7eb]"
                onClick={incrementQuantity}
                disabled={parseInt(quantity) >= item.quantity}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#374151] text-sm">Цена за единицу</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#f3f4f6] p-2.5 sm:p-3 rounded-md">
                <div className="flex items-center">
                  {hasDiscount && (
                    <span className="line-through text-[#9ca3af] mr-2 text-sm">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                  <span className="text-base sm:text-lg font-medium text-[#1f2937]">
                    {formatCurrency(defaultPrice)}
                  </span>
                  {item.product.default_unit && (
                    <span className="text-xs sm:text-sm text-[#6b7280] ml-1">
                      / {item.product.default_unit}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <Badge className="bg-[#d1fae5] text-[#065f46] text-xs">
                    Скидка {discountPercentage}%
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6b7280]">₸</span>
                <Input
                  type="number"
                  value={customPrice}
                  onChange={handlePriceChange}
                  placeholder={defaultPrice.toFixed(2)}
                  min={0}
                  step={0.01}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] text-sm"
                />
              </div>
              <p className="text-xs text-[#6b7280]">
                Оставьте пустым для использования стандартной цены
              </p>
            </div>
          </div>

          <div className="border-t pt-3 sm:pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[#374151] text-sm">Итоговая сумма:</span>
              <span className="text-xl sm:text-2xl font-bold text-[#1f2937]">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            {hasDiscount && customPrice === "" && (
              <p className="text-xs sm:text-sm text-[#059669] text-right mt-1">
                Экономия: {formatCurrency((item.price * (parseInt(quantity) || 0)) - totalPrice)}
              </p>
            )}
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
            disabled={isLoading || !quantity || parseInt(quantity) === 0}
          >
            {isLoading ? "Обработка..." : "Завершить продажу"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellItemModal;