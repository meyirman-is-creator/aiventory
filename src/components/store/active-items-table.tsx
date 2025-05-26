"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { StoreItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  getStatusDisplayName,
  getStatusBadgeColor,
} from "@/lib/utils";
import { ShoppingCart, PercentIcon, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeFromStore } from "@/redux/slices/storeSlice";
import { cn } from "@/lib/utils";
import DiscountModal from "@/components/store/discount-form";
import SellItemModal from "@/components/store/sell-item-modal";
import { AppDispatch } from "@/redux/store";

interface ActiveItemsTableProps {
  items: StoreItem[];
  isLoading: boolean;
}

const ActiveItemsTable = ({ items, isLoading }: ActiveItemsTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSellItem = (item: StoreItem) => {
    setSelectedItem(item);
    setSellModalOpen(true);
  };

  const handleAddDiscount = (item: StoreItem) => {
    setSelectedItem(item);
    setDiscountModalOpen(true);
  };

  const handleRemoveItem = async (item: StoreItem) => {
    try {
      await dispatch(removeFromStore(item.sid)).unwrap();
      toast({
        title: "Товар убран",
        description: `${item.product.name} был убран с витрины.`,
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось убрать товар.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280]">Загрузка активных товаров...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border border-[#e5e7eb] rounded-md">
        <p className="text-[#6b7280]">Нет активных товаров</p>
        <p className="text-sm text-[#6b7280] mt-1">
          Переместите товары со склада в магазин
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e5e7eb]">
                <TableHead className="text-[#374151] font-semibold">Товар</TableHead>
                <TableHead className="text-[#374151] font-semibold hidden lg:table-cell">Категория</TableHead>
                <TableHead className="text-[#374151] font-semibold hidden sm:table-cell">Статус</TableHead>
                <TableHead className="text-[#374151] font-semibold">Кол-во</TableHead>
                <TableHead className="text-[#374151] font-semibold">Цена</TableHead>
                <TableHead className="text-[#374151] font-semibold hidden md:table-cell">Срок годности</TableHead>
                <TableHead className="text-[#374151] font-semibold">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const isExpiring = item.days_until_expiry !== null && item.days_until_expiry !== undefined && item.days_until_expiry <= 7;
                const hasDiscount =
                  item.current_discounts && item.current_discounts.length > 0;
                const discountPercentage = hasDiscount
                  ? item.current_discounts[0].percentage
                  : 0;

                return (
                  <TableRow key={item.sid} className="border-b border-[#f3f4f6]">
                    <TableCell className="font-medium text-[#1f2937]">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-xs text-[#6b7280] lg:hidden">
                          {item.product.category?.name || "Без категории"}
                        </span>
                        {item.batch_code && (
                          <span className="text-xs text-[#9ca3af]">
                            Партия: {item.batch_code}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#374151] hidden lg:table-cell">
                      {item.product.category?.name || "Без категории"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status) === "Active"
                          ? "Активен"
                          : getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1 text-[#6b7280]" />
                        {item.quantity}
                        {item.product.default_unit && (
                          <span className="text-xs text-[#9ca3af] ml-1">
                            {item.product.default_unit}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="line-through text-xs text-[#9ca3af]">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                        <span className="text-[#1f2937] font-medium">
                          {hasDiscount
                            ? formatCurrency(
                              item.price * (1 - discountPercentage / 100)
                            )
                            : formatCurrency(item.price)}
                        </span>
                        {hasDiscount && (
                          <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs bg-[#d1fae5] text-[#065f46] w-fit">
                            -{discountPercentage}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center text-[#374151]">
                        {item.expire_date ? (
                          <div className="flex flex-col">
                            <span>{formatDate(item.expire_date)}</span>
                            {item.days_until_expiry !== null && item.days_until_expiry !== undefined && (
                              <span className={cn(
                                "text-xs",
                                item.days_until_expiry <= 3 ? "text-[#ef4444]" :
                                item.days_until_expiry <= 7 ? "text-[#f59e0b]" :
                                "text-[#6b7280]"
                              )}>
                                {item.days_until_expiry === 0 ? "Истекает сегодня" :
                                 item.days_until_expiry === 1 ? "Истекает завтра" :
                                 `Осталось ${item.days_until_expiry} дн.`}
                              </span>
                            )}
                          </div>
                        ) : (
                          "Не указан"
                        )}
                        {isExpiring && (
                          <AlertCircle className="ml-2 h-4 w-4 text-[#f59e0b]" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff] text-xs sm:text-sm"
                          onClick={() => handleSellItem(item)}
                        >
                          <ShoppingCart size={14} className="mr-1" />
                          Продать
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#10b981] text-[#059669] hover:bg-[#d1fae5] text-xs sm:text-sm"
                          onClick={() => handleAddDiscount(item)}
                        >
                          <PercentIcon size={14} className="mr-1" />
                          <span className="hidden sm:inline">Скидка</span>
                          <span className="sm:hidden">%</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#fecaca] text-[#dc2626] hover:bg-[#fee2e2] text-xs sm:text-sm"
                          onClick={() => handleRemoveItem(item)}
                        >
                          Убрать
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedItem && (
        <>
          <DiscountModal
            item={selectedItem}
            open={isDiscountModalOpen}
            onClose={() => setDiscountModalOpen(false)}
          />
          <SellItemModal
            item={selectedItem}
            open={isSellModalOpen}
            onClose={() => setSellModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default ActiveItemsTable;