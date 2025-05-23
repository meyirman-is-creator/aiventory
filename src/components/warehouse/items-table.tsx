"use client";

import { useState } from "react";
import { WarehouseItem, UrgencyLevel } from "@/lib/types";
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
  formatDate,
  getStatusDisplayName,
  getStatusBadgeColor,
} from "@/lib/utils";
import { ExternalLink, AlertTriangle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import MoveToStoreModal from "@/components/warehouse/move-to-store-modal";

interface WarehouseItemsTableProps {
  items: WarehouseItem[];
  isLoading: boolean;
}

const getUrgencyIcon = (level?: UrgencyLevel) => {
  switch (level) {
    case UrgencyLevel.CRITICAL:
      return <AlertTriangle className="h-4 w-4 text-[#ef4444]" />;
    case UrgencyLevel.URGENT:
      return <AlertCircle className="h-4 w-4 text-[#f59e0b]" />;
    default:
      return null;
  }
};

const getUrgencyBadgeClass = (level?: UrgencyLevel) => {
  switch (level) {
    case UrgencyLevel.CRITICAL:
      return "bg-[#fee2e2] text-[#dc2626] border-[#fecaca]";
    case UrgencyLevel.URGENT:
      return "bg-[#fef3c7] text-[#d97706] border-[#fcd34d]";
    default:
      return "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]";
  }
};

const WarehouseItemsTable = ({
  items,
  isLoading,
}: WarehouseItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);

  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
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

  const hasAnyExpiration = items.some((item) => item.expire_date);

  return (
    <>
      <div className="rounded-md border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e5e7eb]">
                <TableHead className="font-semibold text-[#1f2937]">
                  Товар
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
                <TableHead className="font-semibold text-[#1f2937]">
                  Код партии
                </TableHead>
                <TableHead className="font-semibold text-[#1f2937]">
                  Количество
                </TableHead>
                {hasAnyExpiration && (
                  <TableHead className="font-semibold text-[#1f2937]">
                    Срок годности
                  </TableHead>
                )}
                <TableHead className="font-semibold text-[#1f2937]">
                  Дата получения
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
                  new Date(item.expire_date)
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
                        {getUrgencyIcon(item.urgency_level)}
                        <Badge className={cn("border", getUrgencyBadgeClass(item.urgency_level))}>
                          {item.urgency_level === UrgencyLevel.CRITICAL
                            ? "Критичный"
                            : item.urgency_level === UrgencyLevel.URGENT
                              ? "Срочный"
                              : "Обычный"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.batch_code || "Н/Д"}
                    </TableCell>
                    <TableCell className="text-[#374151]">
                      {item.quantity}
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
                              item.urgency_level === UrgencyLevel.CRITICAL
                                ? "bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]"
                                : item.urgency_level === UrgencyLevel.URGENT
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
                          {item.urgency_level === UrgencyLevel.CRITICAL && (
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