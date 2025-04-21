'use client';

import { useState } from 'react';
import { WarehouseItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, getStatusDisplayName, getStatusBadgeColor } from '@/lib/utils';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MoveToStoreModal from '@/components/warehouse/move-to-store-modal';

interface WarehouseItemsTableProps {
  items: WarehouseItem[];
  isLoading: boolean;
}

const WarehouseItemsTable = ({ items, isLoading }: WarehouseItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  
  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Загрузка товаров на складе...</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">Нет товаров на складе</p>
        <p className="text-sm text-muted-foreground mt-1">
          Загрузите файлы инвентаря для добавления товаров
        </p>
      </div>
    );
  }
  
  // Check if any item has expiration date
  const hasAnyExpiration = items.some(item => item.expire_date);
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-gray-900">Товар</TableHead>
                <TableHead className="font-semibold text-gray-900">Категория</TableHead>
                <TableHead className="font-semibold text-gray-900">Статус</TableHead>
                <TableHead className="font-semibold text-gray-900">Код партии</TableHead>
                <TableHead className="font-semibold text-gray-900">Количество</TableHead>
                {hasAnyExpiration && <TableHead className="font-semibold text-gray-900">Срок годности</TableHead>}
                <TableHead className="font-semibold text-gray-900">Дата получения</TableHead>
                <TableHead className="font-semibold text-gray-900">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const isExpiring = item.expire_date && new Date(item.expire_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <TableRow key={item.sid}>
                    <TableCell className="font-medium text-gray-800">{item.product.name}</TableCell>
                    <TableCell className="text-gray-700">
                      {item.product.category_sid ? item.product.category_sid : 'Н/Д'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status) === 'In Stock' ? 'На складе' : 
                         getStatusDisplayName(item.status) === 'Moved to Store' ? 'Перемещен в магазин' :
                         getStatusDisplayName(item.status) === 'Discarded' ? 'Списан' : 
                         getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.batch_code || 'Н/Д'}</TableCell>
                    <TableCell className="text-gray-700">{item.quantity}</TableCell>
                    {hasAnyExpiration && (
                      <TableCell className="text-gray-700">
                        {item.expire_date ? (
                          <div className="flex items-center">
                            {formatDate(item.expire_date)}
                            {isExpiring && (
                              <AlertTriangle
                                size={16}
                                className="ml-2 text-amber-500"
                              />
                            )}
                          </div>
                        ) : (
                          'Н/Д'
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-gray-700">{formatDate(item.received_at)}</TableCell>
                    <TableCell>
                      {item.status === 'in_stock' && item.quantity > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 hover:bg-brand-purple/20"
                          onClick={() => handleMoveToStore(item)}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Переместить в магазин
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {item.status === 'moved' ? 'Перемещен' : 'Недоступен'}
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