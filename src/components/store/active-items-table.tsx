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
import { ShoppingCart, PercentIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeFromStore } from "@/redux/slices/storeSlice";
import { cn } from "@/lib/utils";
import SellItemModal from "@/components/store/sell-item-modal";
import DiscountModal from "@/components/store/discount-form";
import { AppDispatch } from "@/redux/store";

interface ActiveItemsTableProps {
  items: StoreItem[];
  isLoading: boolean;
}

const ActiveItemsTable = ({ items, isLoading }: ActiveItemsTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
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
        title: "Товар удален",
        description: `${item.product.name} был удален из магазина.`,
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар.",
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
                <TableHead className="text-[#374151] font-semibold">Категория</TableHead>
                <TableHead className="text-[#374151] font-semibold">Статус</TableHead>
                <TableHead className="text-[#374151] font-semibold">Количество</TableHead>
                <TableHead className="text-[#374151] font-semibold">Цена</TableHead>
                <TableHead className="text-[#374151] font-semibold">Срок годности</TableHead>
                <TableHead className="text-[#374151] font-semibold">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const isExpiring =
                  item.expire_date && new Date(item.expire_date);
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const hasDiscount =
                  item.current_discounts && item.current_discounts.length > 0;
                const discountPercentage = hasDiscount
                  ? item.current_discounts[0].percentage
                  : 0;

                return (
                  <TableRow key={item.sid} className="border-b border-[#f3f4f6]">
                    <TableCell className="font-medium text-[#1f2937]">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.product.category?.name || "Н/Д"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status) === "Active"
                          ? "Активен"
                          : getStatusDisplayName(item.status) === "Expired"
                          ? "Истек"
                          : getStatusDisplayName(item.status) === "Removed"
                          ? "Удален"
                          : getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {hasDiscount && (
                          <span className="line-through text-[#9ca3af] mr-2">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                        <span className="text-[#1f2937]">
                          {hasDiscount
                            ? formatCurrency(
                                item.price * (1 - discountPercentage / 100)
                              )
                            : formatCurrency(item.price)}
                        </span>
                        {hasDiscount && (
                          <span className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs bg-[#d1fae5] text-[#065f46]">
                            {discountPercentage}% скидка
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-[#374151]">
                        {item.expire_date
                          ? formatDate(item.expire_date)
                          : "Н/Д"}
                        {isExpiring && (
                          <AlertCircle className="ml-2 h-4 w-4 text-[#f59e0b]" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
                          onClick={() => handleSellItem(item)}
                        >
                          <ShoppingCart size={16} className="mr-1" />
                          Продать
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#10b981] text-[#059669] hover:bg-[#d1fae5]"
                          onClick={() => handleAddDiscount(item)}
                        >
                          <PercentIcon size={16} className="mr-1" />
                          Скидка
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#fecaca] text-[#dc2626] hover:bg-[#fee2e2]"
                          onClick={() => handleRemoveItem(item)}
                        >
                          Удалить
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
          <SellItemModal
            item={selectedItem}
            open={isSellModalOpen}
            onClose={() => setSellModalOpen(false)}
          />
          <DiscountModal
            item={selectedItem}
            open={isDiscountModalOpen}
            onClose={() => setDiscountModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default ActiveItemsTable;