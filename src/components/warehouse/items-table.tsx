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
        <p className="text-muted-foreground">Loading warehouse items...</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No items in warehouse</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload inventory files to add items
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
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Batch Code</TableHead>
                <TableHead>Quantity</TableHead>
                {hasAnyExpiration && <TableHead>Expires At</TableHead>}
                <TableHead>Received At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const isExpiring = item.expire_date && new Date(item.expire_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <TableRow key={item.sid}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell>
                      {item.product.category_sid ? item.product.category_sid : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.batch_code || 'N/A'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    {hasAnyExpiration && (
                      <TableCell>
                        {item.expire_date ? (
                          <div className="flex items-center">
                            {formatDate(item.expire_date)}
                            {isExpiring && (
                              <AlertTriangle
                                size={16}
                                className="ml-2 text-amber-500"
                                title="Expiring soon"
                              />
                            )}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    )}
                    <TableCell>{formatDate(item.received_at)}</TableCell>
                    <TableCell>
                      {item.status === 'in_stock' && item.quantity > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 hover:bg-brand-purple/20"
                          onClick={() => handleMoveToStore(item)}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Move to Store
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {item.status === 'moved' ? 'Moved' : 'Unavailable'}
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