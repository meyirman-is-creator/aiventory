"use client";

import { useState } from "react";
import { WarehouseItem } from "@/lib/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatDate,
  getStatusDisplayName,
  getStatusBadgeColor,
  formatCurrency,
} from "@/lib/utils";
import { ExternalLink, AlertTriangle, AlertCircle, Zap, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import MoveToStoreModal from "@/components/warehouse/move-to-store-modal";

interface WarehouseItemsTableProps {
  items: WarehouseItem[];
  isLoading: boolean;
}

type SortField = "product_name" | "quantity" | "expire_date" | "received_at" | "batch_code" | "wholesale_price" | "suggested_price";

const getUrgencyIcon = (urgency?: string) => {
  switch (urgency) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-[#ef4444]" />;
    case "high":
    case "medium":
      return <AlertCircle className="h-4 w-4 text-[#f59e0b]" />;
    default:
      return null;
  }
};

const getUrgencyBadgeClass = (urgency?: string) => {
  switch (urgency) {
    case "critical":
      return "bg-[#fee2e2] text-[#dc2626] border-[#fecaca]";
    case "high":
    case "medium":
      return "bg-[#fef3c7] text-[#d97706] border-[#fcd34d]";
    default:
      return "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]";
  }
};

const getUrgencyText = (urgency?: string) => {
  switch (urgency) {
    case "critical":
      return "Критичный";
    case "high":
      return "Высокий";
    case "medium":
      return "Средний";
    case "low":
      return "Низкий";
    default:
      return "Обычный";
  }
};

const WarehouseItemsTable = ({
  items,
  isLoading,
}: WarehouseItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<{ sort_by: SortField; sort_order: "asc" | "desc" }>({
    sort_by: "product_name",
    sort_order: "asc"
  });

  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
  };

  const toggleItemSelection = (itemSid: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemSid)) {
      newSelected.delete(itemSid);
    } else {
      newSelected.add(itemSid);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(items.map(item => item.sid)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleSort = (field: SortField) => {
    if (sorting.sort_by === field) {
      setSorting({
        sort_by: field,
        sort_order: sorting.sort_order === "asc" ? "desc" : "asc"
      });
    } else {
      setSorting({ sort_by: field, sort_order: "asc" });
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sorting.sort_by !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-[#9ca3af]" />;
    }
    return sorting.sort_order === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1 text-[#6322FE]" />
      : <ArrowDown className="h-4 w-4 ml-1 text-[#6322FE]" />;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280]">Загрузка товаров на складе...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border border-[#e5e7eb] rounded-md">
        <p className="text-[#6b7280]">Нет товаров на складе</p>
        <p className="text-sm text-[#6b7280] mt-1">
          Загрузите файлы инвентаря для добавления товаров
        </p>
      </div>
    );
  }

  const isAllSelected = items.length > 0 && items.every(item => selectedItems.has(item.sid));
  const hasAnyExpiration = items.some((item) => item.expire_date);

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllItems();
    }
  };

  return (
    <>
      <div className="rounded-md border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e5e7eb]">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                  onClick={() => handleSort("product_name")}
                >
                  <div className="flex items-center">
                    Товар
                    <SortIcon field="product_name" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-[#1f2937]">
                  Категория
                </TableHead>
                <TableHead className="font-semibold text-[#1f2937]">
                  Статус
                </TableHead>
                <TableHead className="font-semibold text-[#1f2937]">
                  Срочность
                </TableHead>
                <TableHead 
                  className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                  onClick={() => handleSort("batch_code")}
                >
                  <div className="flex items-center">
                    Код партии
                    <SortIcon field="batch_code" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center">
                    Количество
                    <SortIcon field="quantity" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                  onClick={() => handleSort("wholesale_price")}
                >
                  <div className="flex items-center">
                    Оптовая цена
                    <SortIcon field="wholesale_price" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                  onClick={() => handleSort("suggested_price")}
                >
                  <div className="flex items-center">
                    Рекомендуемая цена
                    <SortIcon field="suggested_price" />
                  </div>
                </TableHead>
                {hasAnyExpiration && (
                  <TableHead 
                    className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                    onClick={() => handleSort("expire_date")}
                  >
                    <div className="flex items-center">
                      Срок годности
                      <SortIcon field="expire_date" />
                    </div>
                  </TableHead>
                )}
                <TableHead 
                  className="font-semibold text-[#1f2937] cursor-pointer hover:bg-[#f9fafb]"
                  onClick={() => handleSort("received_at")}
                >
                  <div className="flex items-center">
                    Дата получения
                    <SortIcon field="received_at" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-[#1f2937]">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const isExpiring =
                  item.expire_date &&
                  new Date(item.expire_date) <=
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const urgency = item.warehouse_action?.urgency;
                const isSelected = selectedItems.has(item.sid);

                return (
                  <TableRow 
                    key={item.sid} 
                    className={cn(
                      "border-b border-[#f3f4f6]",
                      isSelected && "bg-[#f3f4f6]"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleItemSelection(item.sid)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-[#1f2937]">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.product.category?.name || "Н/Д"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status) === "In Stock"
                          ? "На складе"
                          : getStatusDisplayName(item.status) ===
                            "Moved to Store"
                            ? "Перемещен в магазин"
                            : getStatusDisplayName(item.status) === "Discarded"
                              ? "Списан"
                              : getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getUrgencyIcon(urgency)}
                        <Badge className={cn("border", getUrgencyBadgeClass(urgency))}>
                          {getUrgencyText(urgency)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.batch_code || "Н/Д"}
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.quantity} {item.product.default_unit || "шт"}
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.wholesale_price ? formatCurrency(item.wholesale_price) : "Н/Д"}
                    </TableCell>
                    <TableCell className="text-[#374151] font-semibold">
                      {item.suggested_price ? formatCurrency(item.suggested_price) : "Н/Д"}
                    </TableCell>
                    {hasAnyExpiration && (
                      <TableCell className="text-[#374151]">
                        {item.expire_date ? (
                          <div className="flex items-center">
                            {formatDate(item.expire_date)}
                            {isExpiring && (
                              <AlertTriangle
                                size={16}
                                className="ml-2 text-[#f59e0b]"
                              />
                            )}
                          </div>
                        ) : (
                          "Н/Д"
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-[#374151]">
                      {formatDate(item.received_at)}
                    </TableCell>
                    <TableCell>
                      {item.status === "in_stock" && item.quantity > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "border-[#6322FE]/20 hover:bg-[#6322FE]/20",
                              urgency === "critical"
                                ? "bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]"
                                : urgency === "high" || urgency === "medium"
                                  ? "bg-[#fef3c7] text-[#d97706] hover:bg-[#fcd34d]"
                                  : "bg-[#EBE3FF] text-[#6322FE]"
                            )}
                            onClick={() => handleMoveToStore(item)}
                          >
                            <ExternalLink size={16} className="mr-1" />
                            {item.warehouse_action?.action === "move_to_store_with_discount"
                              ? "Переместить со скидкой"
                              : item.warehouse_action?.action === "move_to_store_urgent"
                                ? "Срочно переместить"
                                : "Переместить в магазин"}
                          </Button>
                          {urgency === "critical" && (
                            <Zap className="h-4 w-4 text-[#ef4444]" />
                          )}
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="border-[#e5e7eb] text-[#9ca3af]">
                          {item.status === "moved" ? "Перемещен" : "Недоступен"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedItem && (
        <MoveToStoreModal
          item={selectedItem}
          open={isMoveModalOpen}
          onClose={() => setMoveModalOpen(false)}
        />
      )}
    </>
  );
};

export default WarehouseItemsTable;