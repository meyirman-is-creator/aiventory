"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { CartItem } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeFromCart, checkoutCart } from "@/redux/slices/storeSlice";
import { AppDispatch } from "@/redux/store";

interface CartItemsTableProps {
    items: CartItem[];
    isLoading: boolean;
}

const CartItemsTable = ({ items, isLoading }: CartItemsTableProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { toast } = useToast();

    const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.price_per_unit,
        0
    );

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleRemoveItem = async (item: CartItem) => {
        try {
            await dispatch(removeFromCart(item.sid)).unwrap();
            toast({
                title: "Удалено из корзины",
                description: `${item.product.name} удален из корзины`,
            });
        } catch {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить товар из корзины",
                variant: "destructive",
            });
        }
    };

    const handleCheckout = async () => {
        if (items.length === 0) {
            toast({
                title: "Корзина пуста",
                description: "Добавьте товары в корзину для оформления продажи",
                variant: "destructive",
            });
            return;
        }

        setIsCheckingOut(true);
        try {
            const response = await dispatch(checkoutCart()).unwrap();
            toast({
                title: "Продажа оформлена",
                description: `Успешно продано ${response.items_count} товаров на сумму ${formatCurrency(
                    response.total_amount
                )}`,
            });
        } catch {
            toast({
                title: "Ошибка",
                description: "Не удалось оформить продажу",
                variant: "destructive",
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <p className="text-[#6b7280]">Загрузка корзины...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-8 border border-[#e5e7eb] rounded-md">
                <ShoppingBag className="mx-auto h-12 w-12 text-[#6b7280] mb-4" />
                <p className="text-[#6b7280]">Корзина пуста</p>
                <p className="text-sm text-[#6b7280] mt-1">
                    Добавьте товары из активных товаров
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-[#e5e7eb] overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[#e5e7eb]">
                                <TableHead className="text-[#374151] font-semibold">Товар</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Категория</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Количество</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Цена за ед.</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Сумма</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Срок годности</TableHead>
                                <TableHead className="text-[#374151] font-semibold">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => {
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
                                        <TableCell className="text-[#374151]">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-[#1f2937]">
                                            {formatCurrency(item.price_per_unit)}
                                        </TableCell>
                                        <TableCell className="font-medium text-[#1f2937]">
                                            {formatCurrency(item.total_price)}
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
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-[#fecaca] text-[#dc2626] hover:bg-[#fee2e2]"
                                                onClick={() => handleRemoveItem(item)}
                                            >
                                                <Trash2 size={16} className="mr-1" />
                                                Удалить
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex justify-between items-center bg-[#f9fafb] p-4 rounded-md border border-[#e5e7eb]">
                <div>
                    <p className="text-sm text-[#6b7280]">Всего товаров: {totalItems}</p>
                    <p className="text-lg font-semibold text-[#1f2937]">
                        Итого: {formatCurrency(totalAmount)}
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                >
                    <ShoppingBag size={20} className="mr-2" />
                    {isCheckingOut ? "Оформление..." : "Оформить продажу"}
                </Button>
            </div>
        </div>
    );
};

export default CartItemsTable;