"use client";

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
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeFromStore } from "@/redux/slices/storeSlice";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/redux/store";

interface ExpiredItemsTableProps {
  items: StoreItem[];
  isLoading: boolean;
}

const ExpiredItemsTable = ({ items, isLoading }: ExpiredItemsTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const handleRemoveItem = async (item: StoreItem) => {
    try {
      await dispatch(removeFromStore(item.sid)).unwrap();
      toast({
        title: "Товар удален",
        description: `${item.product.name} был удален из магазина.`,
      });
    } catch (error: any) {
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
        <p className="text-muted-foreground">Загрузка истекших товаров...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">Нет истекших товаров</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Количество</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Истек</TableHead>
              <TableHead>Потерянная стоимость</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusClass = cn(getStatusBadgeColor(item.status));
              const lostValue = item.price * item.quantity;

              return (
                <TableRow key={item.sid}>
                  <TableCell className="font-medium">
                    {item.product.name}
                  </TableCell>
                  <TableCell>{item.product.category?.name || "Н/Д"}</TableCell>
                  <TableCell>
                    <Badge className={statusClass}>
                      {getStatusDisplayName(item.status) === "Expired"
                        ? "Истек"
                        : getStatusDisplayName(item.status) === "Removed"
                        ? "Удален"
                        : getStatusDisplayName(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>
                    {item.expire_date ? formatDate(item.expire_date) : "Н/Д"}
                  </TableCell>
                  <TableCell className="text-destructive">
                    {formatCurrency(lostValue)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
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
  );
};

export default ExpiredItemsTable;
