"use client";

import { Sale } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface SalesHistoryTableProps {
  sales: Sale[];
  isLoading: boolean;
}

const SalesHistoryTable = ({ sales, isLoading }: SalesHistoryTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280]">Загрузка истории продаж...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8 border border-[#e5e7eb] rounded-md">
        <ShoppingCart className="mx-auto h-12 w-12 text-[#6b7280] mb-4" />
        <p className="text-[#6b7280]">Нет проданных товаров</p>
        <p className="text-sm text-[#6b7280] mt-1">
          История продаж появится здесь после первой транзакции
        </p>
      </div>
    );
  }

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + (sale.total_amount || sale.sold_qty * sale.sold_price),
    0
  );
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.sold_qty, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e5e7eb]">
                <TableHead className="text-[#374151] font-semibold">Дата и время</TableHead>
                <TableHead className="text-[#374151] font-semibold">Товар</TableHead>
                <TableHead className="text-[#374151] font-semibold">Категория</TableHead>
                <TableHead className="text-[#374151] font-semibold">Количество</TableHead>
                <TableHead className="text-[#374151] font-semibold">Цена за ед.</TableHead>
                <TableHead className="text-[#374151] font-semibold">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.sid} className="border-b border-[#f3f4f6]">
                  <TableCell className="text-[#374151]">
                    {formatDateTime(sale.sold_at)}
                  </TableCell>
                  <TableCell className="font-medium text-[#1f2937]">
                    {sale.product?.name || "Н/Д"}
                  </TableCell>
                  <TableCell className="text-[#374151]">
                    {sale.product?.category?.name || "Н/Д"}
                  </TableCell>
                  <TableCell className="text-[#374151]">
                    {sale.sold_qty}
                  </TableCell>
                  <TableCell className="text-[#1f2937]">
                    {formatCurrency(sale.sold_price)}
                  </TableCell>
                  <TableCell className="font-medium text-[#1f2937]">
                    {formatCurrency(
                      sale.total_amount || sale.sold_qty * sale.sold_price
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[#f9fafb] p-4 rounded-md border border-[#e5e7eb]">
        <div>
          <p className="text-sm text-[#6b7280]">Всего продано: {totalQuantity}</p>
          <p className="text-lg font-semibold text-[#1f2937]">
            Общая выручка: {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryTable;