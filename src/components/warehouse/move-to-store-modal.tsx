"use client";

import { useState, useEffect } from "react";
import { WarehouseItem } from "@/lib/types";
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
import { useWarehouseStore } from "@/store/warehouse-store";
import { Minus, Plus } from "lucide-react";

interface MoveToStoreModalProps {
  item: WarehouseItem;
  open: boolean;
  onClose: () => void;
}

const MoveToStoreModal = ({ item, open, onClose }: MoveToStoreModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(item.product.default_price || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { moveToStore } = useWarehouseStore();
  const { toast } = useToast();

  // Установим рекомендуемую цену, если она есть
  useEffect(() => {
    if (item.suggested_price && item.suggested_price > 0) {
      setPrice(item.suggested_price);
    } else if (item.product.default_price) {
      setPrice(item.product.default_price);
    }
  }, [item]);

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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setPrice(0);
    } else {
      setPrice(value);
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

    if (price <= 0) {
      toast({
        title: "Неверная цена",
        description: "Пожалуйста, введите цену больше 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await moveToStore(item.sid, quantity, price);
      toast({
        title: "Товар перемещен в магазин",
        description: `Успешно перемещено ${quantity} ${item.product.name} в магазин`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description:
          error.response?.data?.detail ||
          "Не удалось переместить товар в магазин",
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
          <DialogTitle className="text-[#1f2937]">Переместить в магазин</DialogTitle>
          <DialogDescription className="text-[#4b5563]">
            Переместить {item.product.name} со склада в магазин
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#1f2937]">Товар</Label>
            <div className="text-sm font-medium text-[#1f2937]">{item.product.name}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-[#1f2937]">
              Количество (Доступно: {item.quantity})
            </Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-r-none border-[#d1d5db]"
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
                className="h-8 rounded-none text-center border-y border-[#d1d5db] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-l-none border-[#d1d5db]"
                onClick={incrementQuantity}
                disabled={quantity >= item.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-[#1f2937]">Цена за единицу</Label>
            <div className="flex items-center">
              <span className="text-sm mr-2 text-[#4b5563]">₸</span>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={handlePriceChange}
                min={0}
                step={0.01}
                className="border-[#d1d5db] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {item.suggested_price !== undefined && item.suggested_price > 0 && (
              <p className="text-xs text-[#16a34a] font-medium">
                Рекомендуемая цена: ₸{item.suggested_price.toFixed(2)}
              </p>
            )}
            {!item.suggested_price && item.product.default_price && (
              <p className="text-xs text-[#6b7280]">
                Стандартная цена: ₸{item.product.default_price.toFixed(2)}
              </p>
            )}
            {item.discount_suggestion && (
              <p className="text-xs text-[#d97706] font-medium">
                Рекомендуемая скидка:{" "}
                {item.discount_suggestion.discount_percent}% (₸
                {item.discount_suggestion.discounted_price.toFixed(2)})
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
            className="border-[#d1d5db] text-[#4b5563]"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Перемещение..." : "Переместить в магазин"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToStoreModal;