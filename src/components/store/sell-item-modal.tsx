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
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const hasDiscount =
    item.current_discounts && item.current_discounts.length > 0;
  const discountPercentage = hasDiscount
    ? item.current_discounts[0].percentage
    : 0;
  const pricePerUnit = hasDiscount
    ? item.price * (1 - discountPercentage / 100)
    : item.price;

  const totalPrice = pricePerUnit * quantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > item.quantity) {
      setQuantity(item.quantity);
    } else {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < item.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmit = async () => {
    if (quantity < 1 || quantity > item.quantity) {
      toast({
        title: "Неверное количество",
        description: `Пожалуйста, введите количество от 1 до ${item.quantity}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(
        recordSale({
          storeItemSid: item.sid,
          soldQty: quantity,
          soldPrice: pricePerUnit,
        })
      ).unwrap();

      toast({
        title: "Продажа зарегистрирована",
        description: `Успешно продано ${quantity} ${item.product.name}`,
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
      <DialogContent className="sm:max-w-md bg-[#ffffff]">
        <DialogHeader>
          <DialogTitle className="text-[#1f2937]">Продажа товара</DialogTitle>
          <DialogDescription className="text-[#6b7280]">
            Оформление продажи товара
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info Section */}
          <div className="bg-[#f9fafb] p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-[#1f2937]">{item.product.name}</h4>
                {item.product.category && (
                  <p className="text-sm text-[#6b7280]">
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
                <Package className="h-3 w-3 mr-1" />
                В наличии: {item.quantity}
              </Badge>
            </div>

            {item.expire_date && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-[#6b7280]" />
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
              <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-2 text-[#6b7280]" />
                <span className="text-[#374151]">
                  Штрихкод: {item.product.barcode}
                </span>
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <Label className="text-[#374151]">Цена за единицу</Label>
            <div className="flex items-center justify-between bg-[#f3f4f6] p-3 rounded-md">
              <div className="flex items-center">
                {hasDiscount && (
                  <span className="line-through text-[#9ca3af] mr-2">
                    {formatCurrency(item.price)}
                  </span>
                )}
                <span className="text-lg font-medium text-[#1f2937]">
                  {formatCurrency(pricePerUnit)}
                </span>
                {item.product.default_unit && (
                  <span className="text-sm text-[#6b7280] ml-1">
                    / {item.product.default_unit}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <Badge className="bg-[#d1fae5] text-[#065f46]">
                  Скидка {discountPercentage}%
                </Badge>
              )}
            </div>
          </div>

          {/* Quantity Section */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-[#374151]">
              Количество
            </Label>
            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-r-none border-[#e5e7eb]"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={item.quantity}
                className="h-10 w-20 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] font-medium"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-l-none border-[#e5e7eb]"
                onClick={incrementQuantity}
                disabled={quantity >= item.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[#374151]">Итоговая сумма:</span>
              <span className="text-2xl font-bold text-[#1f2937]">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            {hasDiscount && (
              <p className="text-sm text-[#059669] text-right mt-1">
                Экономия: {formatCurrency((item.price * quantity) - totalPrice)}
              </p>
            )}
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
            {isLoading ? "Обработка..." : "Завершить продажу"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellItemModal;