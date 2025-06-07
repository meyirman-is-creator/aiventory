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
import { ExternalLink, AlertTriangle, AlertCircle, Zap, ArrowUpDown, ArrowUp, ArrowDown, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import MoveToStoreModal from "@/components/warehouse/move-to-store-modal";
import { useWarehouseStore } from "@/store/warehouse-store";

interface WarehouseItemsTableProps {
  items: WarehouseItem[];
  isLoading: boolean;
  showExpired?: boolean;
}

type SortField = "product_name" | "quantity" | "expire_date" | "received_at" | "batch_code" | "wholesale_price" | "suggested_price";

const getUrgencyIcon = (urgency?: string) => {
  switch (urgency) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return null;
  }
};

const getUrgencyBadgeClass = (urgency?: string) => {
  switch (urgency) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "urgent":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-green-100 text-green-700 border-green-200";
  }
};

const getUrgencyText = (urgency?: string) => {
  switch (urgency) {
    case "critical":
      return "Критичный";
    case "urgent":
      return "Срочный";
    default:
      return "Обычный";
  }
};

const WarehouseItemsTable = ({
  items,
  isLoading,
  showExpired = false,
}: WarehouseItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  
  const { 
    selectedItems, 
    toggleItemSelection, 
    selectAll, 
    clearSelection,
    sorting,
    setSorting
  } = useWarehouseStore();

  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sorting.sort_by === field) {
      setSorting(field, sorting.sort_order === "asc" ? "desc" : "asc");
    } else {
      setSorting(field, "asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sorting.sort_by !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sorting.sort_order === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1 text-[#6322FE]" />
      : <ArrowDown className="h-4 w-4 ml-1 text-[#6322FE]" />;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Загрузка товаров на складе...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-md">
        <p className="text-gray-600">
          {showExpired ? "Нет товаров с истекшим сроком годности" : "Нет товаров на складе"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {showExpired ? "Все товары имеют действующий срок годности" : "Загрузите файлы инвентаря для добавления товаров"}
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
      selectAll();
    }
  };

  return (
    <>
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={showExpired}
                  />
                </TableHead>
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("product_name")}
                >
                  <div className="flex items-center">
                    Товар
                    <SortIcon field="product_name" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Категория
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Статус
                </TableHead>
                {!showExpired && (
                  <TableHead className="font-semibold text-gray-900">
                    Срочность
                  </TableHead>
                )}
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("batch_code")}
                >
                  <div className="flex items-center">
                    Код партии
                    <SortIcon field="batch_code" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center">
                    Количество
                    <SortIcon field="quantity" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("wholesale_price")}
                >
                  <div className="flex items-center">
                    Оптовая цена
                    <SortIcon field="wholesale_price" />
                  </div>
                </TableHead>
                {!showExpired && (
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("suggested_price")}
                  >
                    <div className="flex items-center">
                      Рекомендуемая цена
                      <SortIcon field="suggested_price" />
                    </div>
                  </TableHead>
                )}
                {hasAnyExpiration && (
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("expire_date")}
                  >
                    <div className="flex items-center">
                      Срок годности
                      <SortIcon field="expire_date" />
                    </div>
                  </TableHead>
                )}
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("received_at")}
                >
                  <div className="flex items-center">
                    Дата получения
                    <SortIcon field="received_at" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
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
                const urgency = item.urgency_level;
                const isSelected = selectedItems.has(item.sid);
                const isExpired = item.is_expired;

                return (
                  <TableRow 
                    key={item.sid} 
                    className={cn(
                      "border-b border-gray-100",
                      isSelected && "bg-gray-50",
                      isExpired && "bg-red-50"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleItemSelection(item.sid)}
                        disabled={item.status !== "in_stock" || item.quantity <= 0 || isExpired}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-gray-700">
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
                    {!showExpired && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getUrgencyIcon(urgency)}
                          <Badge className={cn("border", getUrgencyBadgeClass(urgency))}>
                            {getUrgencyText(urgency)}
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-gray-700">
                      {item.batch_code || "Н/Д"}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {item.quantity} {item.product.default_unit || "шт"}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {item.wholesale_price ? formatCurrency(item.wholesale_price) : "Н/Д"}
                    </TableCell>
                    {!showExpired && (
                      <TableCell className="text-gray-700 font-semibold">
                        {item.suggested_price ? formatCurrency(item.suggested_price) : "Н/Д"}
                      </TableCell>
                    )}
                    {hasAnyExpiration && (
                      <TableCell className="text-gray-700">
                        {item.expire_date ? (
                          <div className="flex items-center">
                            {formatDate(item.expire_date)}
                            {isExpiring && !isExpired && (
                              <AlertTriangle
                                size={16}
                                className="ml-2 text-amber-500"
                              />
                            )}
                            {isExpired && (
                              <Ban
                                size={16}
                                className="ml-2 text-red-500"
                              />
                            )}
                          </div>
                        ) : (
                          "Н/Д"
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-gray-700">
                      {formatDate(item.received_at)}
                    </TableCell>
                    <TableCell>
                      {!isExpired && item.status === "in_stock" && item.quantity > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "border-[#6322FE]/20 hover:bg-[#6322FE]/10",
                              urgency === "critical"
                                ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                                : urgency === "urgent"
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300"
                                  : "bg-[#6322FE]/10 text-[#6322FE] border-[#6322FE]/20"
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
                            <Zap className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="border-gray-200 text-gray-400">
                          {isExpired ? "Истек срок" : item.status === "moved" ? "Перемещен" : "Недоступен"}
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

      {selectedItem && !selectedItem.is_expired && (
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