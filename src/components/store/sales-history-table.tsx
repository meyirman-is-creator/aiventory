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
import { ShoppingCart, Package } from "lucide-react";

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
                <TableHead className="text-[#374151] font-semibold hidden lg:table-cell">Категория</TableHead>
                <TableHead className="text-[#374151] font-semibold">Кол-во</TableHead>
                <TableHead className="text-[#374151] font-semibold">Цена за ед.</TableHead>
                <TableHead className="text-[#374151] font-semibold">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.sid} className="border-b border-[#f3f4f6]">
                  <TableCell className="text-[#374151] text-sm">
                    {formatDateTime(sale.sold_at)}
                  </TableCell>
                  <TableCell className="font-medium text-[#1f2937]">
                    <div className="flex flex-col">
                      <span>{sale.product?.name || "Н/Д"}</span>
                      <span className="text-xs text-[#6b7280] lg:hidden">
                        {sale.product?.category?.name || "Без категории"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#374151] hidden lg:table-cell">
                    {sale.product?.category?.name || "Без категории"}
                  </TableCell>
                  <TableCell className="text-[#374151]">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1 text-[#6b7280]" />
                      {sale.sold_qty}
                      {sale.product?.default_unit && (
                        <span className="text-xs text-[#9ca3af] ml-1">
                          {sale.product.default_unit}
                        </span>
                      )}
                    </div>
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f9fafb] p-4 rounded-md border border-[#e5e7eb]">
        <div>
          <p className="text-sm text-[#6b7280]">Всего продано: {totalQuantity} товаров</p>
          <p className="text-lg font-semibold text-[#1f2937]">
            Общая выручка: {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryTable;