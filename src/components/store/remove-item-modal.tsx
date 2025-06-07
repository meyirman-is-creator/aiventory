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
import { partialRemoveFromStore, removeFromStore } from "@/redux/slices/storeSlice";
import { Minus, Plus, Package, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppDispatch } from "@/redux/store";

interface RemoveItemModalProps {
  item: StoreItem;
  open: boolean;
  onClose: () => void;
}

const RemoveItemModal = ({ item, open, onClose }: RemoveItemModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

    setIsLoading(true);

    try {
      if (numQuantity === item.quantity) {
        await dispatch(removeFromStore(item.sid)).unwrap();
        toast({
          title: "Товар убран",
          description: `${item.product.name} полностью убран с витрины.`,
        });
      } else {
        await dispatch(
          partialRemoveFromStore({
            storeItemSid: item.sid,
            quantity: numQuantity,
          })
        ).unwrap();
        toast({
          title: "Товар частично убран",
          description: `Убрано ${numQuantity} ${item.product.default_unit || "шт"} товара ${item.product.name}.`,
        });
      }
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось убрать товар";
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
          <DialogTitle className="text-[#1f2937] text-base sm:text-lg">Убрать товар с витрины</DialogTitle>
          <DialogDescription className="text-[#6b7280] text-xs sm:text-sm">
            Укажите количество товара для удаления из магазина
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2">
          <Card className="border-[#e5e7eb]">
            <CardContent className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
              <div className="flex items-start">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#6322FE] mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1f2937] text-sm sm:text-base">{item.product.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
                    {item.product.category?.name || "Без категории"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#6b7280]">Доступно на витрине:</span>
                <Badge variant="outline">
                  {item.quantity} {item.product.default_unit || "шт"}
                </Badge>
              </div>

              {item.current_discounts && item.current_discounts.length > 0 && (
                <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-md p-2 sm:p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-[#f59e0b] mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-[#92400e]">
                        На товар действует скидка {item.current_discounts[0].percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-[#374151] text-sm font-medium">
              Количество для удаления
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 border-[#e5e7eb] hover:bg-[#f3f4f6] hover:border-[#6322FE] transition-colors"
                onClick={decrementQuantity}
                disabled={quantity === "" || parseInt(quantity) <= 0}
              >
                <Minus className="h-5 w-5 text-[#6b7280]" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="0"
                min={0}
                max={item.quantity}
                className="h-12 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] focus:ring-2 focus:ring-[#6322FE] focus:border-[#6322FE] w-24"
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 border-[#e5e7eb] hover:bg-[#f3f4f6] hover:border-[#6322FE] transition-colors"
                onClick={incrementQuantity}
                disabled={quantity !== "" && parseInt(quantity) >= item.quantity}
              >
                <Plus className="h-5 w-5 text-[#6b7280]" />
              </Button>
              <span className="text-sm text-[#6b7280] ml-2">
                из {item.quantity} {item.product.default_unit || "шт"}
              </span>
            </div>
            {quantity !== "" && parseInt(quantity) === item.quantity && (
              <p className="text-xs text-[#f59e0b]">
                Весь товар будет убран с витрины
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
            className="bg-[#ef4444] hover:bg-[#dc2626] text-[#ffffff] text-sm"
            onClick={handleSubmit}
            disabled={isLoading || !quantity || parseInt(quantity) === 0}
          >
            {isLoading ? "Удаление..." : "Убрать с витрины"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveItemModal;