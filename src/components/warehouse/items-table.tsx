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
  formatCurrency,
  getStatusDisplayName,
  getStatusBadgeColor,
} from "@/lib/utils";
import { ExternalLink, AlertTriangle, AlertCircle, Zap, ArrowUpDown, ArrowUp, ArrowDown, Ban, Trash2, DollarSign} from "lucide-react";
import { cn } from "@/lib/utils";
import MoveToStoreModal from "@/components/warehouse/move-to-store-modal";
import PartialDeleteModal from "@/components/warehouse/partial-delete-modal";
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
      return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
    case "urgent":
      return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />;
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
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const { 
    selectedItems, 
    toggleItemSelection, 
    selectAll, 
    clearSelection,
    sorting,
    setSorting,
    deleteItems
  } = useWarehouseStore();

  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
  };

  const handleDeleteItem = async (item: WarehouseItem) => {
    if (selectedItems.size > 1) {
      try {
        await deleteItems(Array.from(selectedItems));
        clearSelection();
      } catch (error) {
        console.error("Error deleting items:", error);
      }
    } else {
      setSelectedItem(item);
      setDeleteModalOpen(true);
    }
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
      return <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-gray-400" />;
    }
    return sorting.sort_order === "asc" 
      ? <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-[#6322FE]" />
      : <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-[#6322FE]" />;
  };

  if (isLoading) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-gray-600 text-sm">Загрузка товаров на складе...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 border border-gray-200 rounded-md">
        <p className="text-gray-600 text-sm">
          {showExpired ? "Нет товаров с истекшим сроком годности" : "Нет товаров на складе"}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
                <TableHead className="w-[40px] sm:w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={showExpired}
                  />
                </TableHead>
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm min-w-[150px]"
                  onClick={() => handleSort("product_name")}
                >
                  <div className="flex items-center">
                    Товар
                    <SortIcon field="product_name" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm min-w-[120px]">
                  Категория
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm min-w-[100px]">
                  Статус
                </TableHead>
                {!showExpired && (
                  <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm min-w-[100px]">
                    Срочность
                  </TableHead>
                )}
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm min-w-[80px]"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center">
                    Кол-во
                    <SortIcon field="quantity" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm min-w-[100px]"
                  onClick={() => handleSort("wholesale_price")}
                >
                  <div className="flex items-center">
                    Опт. цена
                    <SortIcon field="wholesale_price" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm min-w-[120px]"
                  onClick={() => handleSort("suggested_price")}
                >
                  <div className="flex items-center">
                    Рек. цена
                    <SortIcon field="suggested_price" />
                  </div>
                </TableHead>
                {hasAnyExpiration && (
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm min-w-[120px]"
                    onClick={() => handleSort("expire_date")}
                  >
                    <div className="flex items-center">
                      Срок годности
                      <SortIcon field="expire_date" />
                    </div>
                  </TableHead>
                )}
                <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm min-w-[150px]">
                  Рекомендации
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm min-w-[150px]">
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
                    <TableCell className="py-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleItemSelection(item.sid)}
                        disabled={item.status !== "in_stock" || item.quantity <= 0 || isExpired}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 text-xs sm:text-sm py-2">
                      <div className="flex flex-col">
                        <span>{item.product.name}</span>
                        {item.batch_code && (
                          <span className="text-xs text-gray-500">
                            Партия: {item.batch_code}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs sm:text-sm py-2">
                      {item.product.category?.name || "Н/Д"}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={cn(statusClass, "text-xs")}>
                        {getStatusDisplayName(item.status) === "In Stock"
                          ? "На складе"
                          : getStatusDisplayName(item.status) === "Moved to Store"
                            ? "Перемещен"
                            : getStatusDisplayName(item.status) === "Discarded"
                              ? "Списан"
                              : getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    {!showExpired && (
                      <TableCell className="py-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {getUrgencyIcon(urgency)}
                          <Badge className={cn("border text-xs", getUrgencyBadgeClass(urgency))}>
                            {getUrgencyText(urgency)}
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-gray-700 text-xs sm:text-sm py-2">
                      {item.quantity} {item.product.default_unit || "шт"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs sm:text-sm py-2">
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                        {item.wholesale_price ? formatCurrency(item.wholesale_price) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs sm:text-sm py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.suggested_price ? formatCurrency(item.suggested_price) : "—"}
                        </span>
                        {item.discount_suggestion && (
                          <span className="text-xs text-amber-600">
                            -{item.discount_suggestion.discount_percent}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {hasAnyExpiration && (
                      <TableCell className="text-gray-700 text-xs sm:text-sm py-2">
                        {item.expire_date ? (
                          <div className="flex items-center">
                            {formatDate(item.expire_date)}
                            {isExpiring && !isExpired && (
                              <AlertTriangle
                                size={14}
                                className="ml-1 sm:ml-2 text-amber-500"
                              />
                            )}
                            {isExpired && (
                              <Ban
                                size={14}
                                className="ml-1 sm:ml-2 text-red-500"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Н/Д</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="py-2">
                      {item.warehouse_action && (
                        <div className="flex items-center space-x-1">
                          {item.warehouse_action.urgency === "critical" && (
                            <Zap className="h-3 w-3 text-red-500" />
                          )}
                          {item.warehouse_action.urgency === "urgent" && (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-xs text-gray-600">
                            {item.warehouse_action.recommendation}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {isExpired ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteItem(item)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          <Trash2 size={12} className="mr-1" />
                          Удалить
                        </Button>
                      ) : item.status === "in_stock" && item.quantity > 0 ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "text-xs",
                              "border-[#6322FE]/20 hover:bg-[#6322FE]/10",
                              urgency === "critical"
                                ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                                : urgency === "urgent"
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300"
                                  : "bg-[#6322FE]/10 text-[#6322FE] border-[#6322FE]/20"
                            )}
                            onClick={() => handleMoveToStore(item)}
                          >
                            <ExternalLink size={12} className="mr-1" />
                            <span>
                              {item.warehouse_action?.action === "move_to_store_with_discount"
                                ? "Со скидкой"
                                : item.warehouse_action?.action === "move_to_store_urgent"
                                  ? "Срочно"
                                  : "Переместить"}
                            </span>
                          </Button>
                          {selectedItems.size <= 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteItem(item)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="border-gray-200 text-gray-400 text-xs">
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

      {selectedItem && !selectedItem.is_expired && (
        <MoveToStoreModal
          item={selectedItem}
          open={isMoveModalOpen}
          onClose={() => setMoveModalOpen(false)}
        />
      )}

      {selectedItem && (
        <PartialDeleteModal
          item={selectedItem}
          open={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default WarehouseItemsTable;