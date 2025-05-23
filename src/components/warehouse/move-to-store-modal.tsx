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
import { Minus, Plus, Package, AlertTriangle, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

interface MoveToStoreModalProps {
  item: WarehouseItem;
  open: boolean;
  onClose: () => void;
}

const MoveToStoreModal = ({ item, open, onClose }: MoveToStoreModalProps) => {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(item.product.default_price || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { moveToStore, fetchItems } = useWarehouseStore();
  const { toast } = useToast();

  useEffect(() => {
    setQuantity("1");
    if (item.suggested_price && item.suggested_price > 0) {
      setPrice(item.suggested_price);
    } else if (item.product.default_price) {
      setPrice(item.product.default_price);
    }
  }, [item]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity("");
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= item.quantity) {
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
    const numQuantity = parseInt(quantity) || 0;

    if (numQuantity < 1 || numQuantity > item.quantity) {
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
      await moveToStore(item.sid, numQuantity, price);
      await fetchItems();
      toast({
        title: "Товар перемещен в магазин",
        description: `Успешно перемещено ${numQuantity} ${item.product.name} в магазин`,
      });
      onClose();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as ApiErrorResponse).response?.data?.detail
        : "Не удалось переместить товар в магазин";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilExpiry = () => {
    if (!item.expire_date) return null;
    const today = new Date();
    const expireDate = new Date(item.expire_date);
    return Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[65%] max-w-[800px] bg-[#ffffff] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1f2937] text-lg sm:text-xl">Переместить в магазин</DialogTitle>
          <DialogDescription className="text-[#6b7280] text-sm sm:text-base">
            Переместить товар со склада в магазин для продажи
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 sm:py-4">
          <Card className="border-[#e5e7eb]">
            <CardContent className="pt-3 sm:pt-4 space-y-3">
              <div className="flex items-start">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#6322FE] mr-2 sm:mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1f2937] text-sm sm:text-base">{item.product.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">{item.product.category?.name || "Без категории"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                {item.product.barcode && (
                  <div>
                    <p className="text-[#6b7280]">Штрих-код</p>
                    <p className="font-medium text-[#1f2937]">{item.product.barcode}</p>
                  </div>
                )}
                {item.batch_code && (
                  <div>
                    <p className="text-[#6b7280]">Код партии</p>
                    <p className="font-medium text-[#1f2937]">{item.batch_code}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#6b7280]">Доступно</p>
                  <p className="font-medium text-[#1f2937]">{item.quantity} {item.product.default_unit || "шт"}</p>
                </div>
                <div>
                  <p className="text-[#6b7280]">Дата получения</p>
                  <p className="font-medium text-[#1f2937]">{formatDate(item.received_at)}</p>
                </div>
                {item.expire_date && (
                  <div>
                    <p className="text-[#6b7280]">Срок годности</p>
                    <p className="font-medium text-[#1f2937]">{formatDate(item.expire_date)}</p>
                  </div>
                )}
                {daysUntilExpiry !== null && (
                  <div>
                    <p className="text-[#6b7280]">До истечения</p>
                    <p className={`font-medium ${daysUntilExpiry <= 3 ? "text-[#ef4444]" :
                        daysUntilExpiry <= 7 ? "text-[#f59e0b]" : "text-[#1f2937]"
                      }`}>
                      {daysUntilExpiry} дней
                    </p>
                  </div>
                )}
              </div>

              {item.warehouse_action && (
                <>
                  <Separator />
                  <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-md p-2 sm:p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-[#f59e0b] mr-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-[#92400e]">
                          {item.warehouse_action.reason}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.warehouse_action.urgency === "critical" && (
                            <Badge className="bg-[#ef4444] text-white text-xs">Критический</Badge>
                          )}
                          {item.warehouse_action.discount_suggestion && (
                            <Badge className="bg-[#d97706] text-white text-xs">
                              <Tag className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              Скидка {item.warehouse_action.discount_suggestion}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-[#374151] text-sm sm:text-base font-medium">
              Количество для перемещения
            </Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-r-none border-[#e5e7eb]"
                onClick={decrementQuantity}
                disabled={quantity === "" || parseInt(quantity) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="0"
                min={0}
                max={item.quantity}
                className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] focus:ring-2 focus:ring-[#6322FE] focus:border-[#6322FE] placeholder:text-[#9ca3af]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-l-none border-[#e5e7eb]"
                onClick={incrementQuantity}
                disabled={quantity !== "" && parseInt(quantity) >= item.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-[#374151] text-sm sm:text-base">Цена за единицу</Label>
            <div className="flex items-center">
              <span className="text-xs sm:text-sm mr-2 text-[#6b7280]">₸</span>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={handlePriceChange}
                min={0}
                step={0.01}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] text-sm sm:text-base"
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
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