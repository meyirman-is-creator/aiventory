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
import {
  formatDate,
  getStatusDisplayName,
  getStatusBadgeColor,
} from "@/lib/utils";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import MoveToStoreModal from "@/components/warehouse/move-to-store-modal";

interface ExpiringItemsTableProps {
  items: WarehouseItem[];
  isLoading: boolean;
}

const ExpiringItemsTable = ({ items, isLoading }: ExpiringItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);

  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280]">Загрузка товаров с истекающим сроком...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border border-[#e5e7eb] rounded-md">
        <p className="text-[#6b7280]">Нет товаров с истекающим сроком</p>
        <p className="text-sm text-[#6b7280] mt-1">
          У всех ваших товаров хорошие сроки годности
        </p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    if (!a.expire_date) return 1;
    if (!b.expire_date) return -1;
    return (
      new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime()
    );
  });

  return (
    <>
      <div className="rounded-md border border-[#fcd34d] overflow-hidden bg-[#fffbeb]/50">
        <div className="p-4 bg-[#fef3c7] border-b border-[#fcd34d]">
          <div className="flex items-center text-[#92400e]">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">
              Эти товары истекут в течение ближайших 7 дней. Рассмотрите возможность перемещения их в магазин и применения скидок.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#fcd34d]">
                <TableHead className="font-semibold text-[#1f2937]">Товар</TableHead>
                <TableHead className="font-semibold text-[#1f2937]">Статус</TableHead>
                <TableHead className="font-semibold text-[#1f2937]">Код партии</TableHead>
                <TableHead className="font-semibold text-[#1f2937]">Количество</TableHead>
                <TableHead className="font-semibold text-[#1f2937]">Истекает через</TableHead>
                <TableHead className="font-semibold text-[#1f2937]">Дата получения</TableHead>
                <TableHead className="font-semibold text-[#1f2937]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const today = new Date();
                const expireDate = item.expire_date
                  ? new Date(item.expire_date)
                  : null;

                const daysUntilExpiration = expireDate
                  ? Math.ceil(
                    (expireDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24)
                  )
                  : null;

                let urgencyClass = "";
                if (daysUntilExpiration !== null) {
                  if (daysUntilExpiration <= 0) {
                    urgencyClass = "text-[#ef4444] font-bold";
                  } else if (daysUntilExpiration <= 3) {
                    urgencyClass = "text-[#dc2626]";
                  } else if (daysUntilExpiration <= 5) {
                    urgencyClass = "text-[#d97706]";
                  } else {
                    urgencyClass = "text-[#f59e0b]";
                  }
                }

                return (
                  <TableRow key={item.sid} className="border-b border-[#fcd34d]/50">
                    <TableCell className="font-medium text-[#1f2937]">
                      {item.product.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status) === 'In Stock' ? 'На складе' :
                          getStatusDisplayName(item.status) === 'Moved to Store' ? 'Перемещен в магазин' :
                            getStatusDisplayName(item.status) === 'Discarded' ? 'Списан' :
                              getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#374151]">{item.batch_code || "Н/Д"}</TableCell>
                    <TableCell className="text-[#374151]">{item.quantity}</TableCell>
                    <TableCell>
                      {daysUntilExpiration !== null ? (
                        <span className={urgencyClass}>
                          {daysUntilExpiration <= 0
                            ? "Истек"
                            : daysUntilExpiration === 1
                              ? "1 день"
                              : `${daysUntilExpiration} дней`}
                        </span>
                      ) : (
                        "Н/Д"
                      )}
                    </TableCell>
                    <TableCell className="text-[#374151]">{formatDate(item.received_at)}</TableCell>
                    <TableCell>
                      {item.status === "in_stock" && item.quantity > 0 ? (
                        <Button
                          size="sm"
                          className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
                          onClick={() => handleMoveToStore(item)}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Переместить в магазин
                        </Button>
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

export default ExpiringItemsTable;