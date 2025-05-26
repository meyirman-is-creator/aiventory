"use client";

import { RemovedItem } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    formatCurrency,
    formatDate,
    formatDateTime,
} from "@/lib/utils";
import { AlertTriangle, Package } from "lucide-react";

interface RemovedItemsTableProps {
    items: RemovedItem[];
    isLoading: boolean;
}

const RemovedItemsTable = ({ items, isLoading }: RemovedItemsTableProps) => {
    if (isLoading) {
        return (
            <div className="text-center py-8">
                <p className="text-[#6b7280]">Загрузка убранных товаров...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-8 border border-[#e5e7eb] rounded-md">
                <p className="text-[#6b7280]">Нет убранных товаров</p>
                <p className="text-sm text-[#6b7280] mt-1">
                    Здесь будут отображаться товары, убранные с витрины
                </p>
            </div>
        );
    }

    const totalLostValue = items.reduce((sum, item) => sum + item.lost_value, 0);

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-[#e5e7eb] overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[#e5e7eb]">
                                <TableHead className="text-[#374151] font-semibold">Товар</TableHead>
                                <TableHead className="text-[#374151] font-semibold hidden lg:table-cell">Категория</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Причина</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Кол-во</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Цена</TableHead>
                                <TableHead className="text-[#374151] font-semibold hidden md:table-cell">Срок годности</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Потери</TableHead>
                                <TableHead className="text-[#374151] font-semibold hidden lg:table-cell">Убран</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => {
                                const isExpired = item.removal_reason === "Истек срок годности";

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
                                        <TableCell>
                                            <Badge className={isExpired ? "bg-[#fee2e2] text-[#ef4444]" : "bg-[#f3f4f6] text-[#6b7280]"}>
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                {item.removal_reason}
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
                                        <TableCell className="text-[#374151]">
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {item.expire_date ? (
                                                <div className="flex flex-col">
                                                    <span className={isExpired ? "text-[#ef4444]" : "text-[#374151]"}>
                                                        {formatDate(item.expire_date)}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="text-xs text-[#ef4444]">
                                                            Истек
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[#9ca3af]">Не указан</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-[#ef4444] font-medium">
                                            {formatCurrency(item.lost_value)}
                                        </TableCell>
                                        <TableCell className="text-[#6b7280] text-sm hidden lg:table-cell">
                                            {formatDateTime(item.removed_at)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex justify-between items-center bg-[#fee2e2] p-4 rounded-md border border-[#fecaca]">
                <div>
                    <p className="text-sm text-[#7f1d1d]">Всего убрано товаров: {items.length}</p>
                    <p className="text-lg font-semibold text-[#7f1d1d]">
                        Общие потери: {formatCurrency(totalLostValue)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RemovedItemsTable;